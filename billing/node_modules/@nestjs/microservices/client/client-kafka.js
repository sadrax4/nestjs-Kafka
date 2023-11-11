"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientKafka = void 0;
const logger_service_1 = require("@nestjs/common/services/logger.service");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const constants_1 = require("../constants");
const kafka_response_deserializer_1 = require("../deserializers/kafka-response.deserializer");
const enums_1 = require("../enums");
const invalid_kafka_client_topic_exception_1 = require("../errors/invalid-kafka-client-topic.exception");
const helpers_1 = require("../helpers");
const kafka_request_serializer_1 = require("../serializers/kafka-request.serializer");
const client_proxy_1 = require("./client-proxy");
let kafkaPackage = {};
/**
 * @publicApi
 */
class ClientKafka extends client_proxy_1.ClientProxy {
    constructor(options) {
        super();
        this.options = options;
        this.logger = new logger_service_1.Logger(ClientKafka.name);
        this.client = null;
        this.consumer = null;
        this.producer = null;
        this.parser = null;
        this.initialized = null;
        this.responsePatterns = [];
        this.consumerAssignments = {};
        const clientOptions = this.getOptionsProp(this.options, 'client', {});
        const consumerOptions = this.getOptionsProp(this.options, 'consumer', {});
        const postfixId = this.getOptionsProp(this.options, 'postfixId', '-client');
        this.producerOnlyMode = this.getOptionsProp(this.options, 'producerOnlyMode', false);
        this.brokers = clientOptions.brokers || [constants_1.KAFKA_DEFAULT_BROKER];
        // Append a unique id to the clientId and groupId
        // so they don't collide with a microservices client
        this.clientId =
            (clientOptions.clientId || constants_1.KAFKA_DEFAULT_CLIENT) + postfixId;
        this.groupId = (consumerOptions.groupId || constants_1.KAFKA_DEFAULT_GROUP) + postfixId;
        kafkaPackage = (0, load_package_util_1.loadPackage)('kafkajs', ClientKafka.name, () => require('kafkajs'));
        this.parser = new helpers_1.KafkaParser((options && options.parser) || undefined);
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    subscribeToResponseOf(pattern) {
        const request = this.normalizePattern(pattern);
        this.responsePatterns.push(this.getResponsePatternName(request));
    }
    async close() {
        this.producer && (await this.producer.disconnect());
        this.consumer && (await this.consumer.disconnect());
        this.producer = null;
        this.consumer = null;
        this.initialized = null;
        this.client = null;
    }
    async connect() {
        if (this.initialized) {
            return this.initialized.then(() => this.producer);
        }
        this.initialized = new Promise(async (resolve, reject) => {
            try {
                this.client = this.createClient();
                if (!this.producerOnlyMode) {
                    const partitionAssigners = [
                        (config) => new helpers_1.KafkaReplyPartitionAssigner(this, config),
                    ];
                    const consumerOptions = Object.assign({
                        partitionAssigners,
                    }, this.options.consumer || {}, {
                        groupId: this.groupId,
                    });
                    this.consumer = this.client.consumer(consumerOptions);
                    // set member assignments on join and rebalance
                    this.consumer.on(this.consumer.events.GROUP_JOIN, this.setConsumerAssignments.bind(this));
                    await this.consumer.connect();
                    await this.bindTopics();
                }
                this.producer = this.client.producer(this.options.producer || {});
                await this.producer.connect();
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
        return this.initialized.then(() => this.producer);
    }
    async bindTopics() {
        if (!this.consumer) {
            throw Error('No consumer initialized');
        }
        const consumerSubscribeOptions = this.options.subscribe || {};
        if (this.responsePatterns.length > 0) {
            await this.consumer.subscribe({
                ...consumerSubscribeOptions,
                topics: this.responsePatterns,
            });
        }
        await this.consumer.run(Object.assign(this.options.run || {}, {
            eachMessage: this.createResponseCallback(),
        }));
    }
    createClient() {
        const kafkaConfig = Object.assign({ logCreator: helpers_1.KafkaLogger.bind(null, this.logger) }, this.options.client, { brokers: this.brokers, clientId: this.clientId });
        return new kafkaPackage.Kafka(kafkaConfig);
    }
    createResponseCallback() {
        return async (payload) => {
            const rawMessage = this.parser.parse(Object.assign(payload.message, {
                topic: payload.topic,
                partition: payload.partition,
            }));
            if ((0, shared_utils_1.isUndefined)(rawMessage.headers[enums_1.KafkaHeaders.CORRELATION_ID])) {
                return;
            }
            const { err, response, isDisposed, id } = await this.deserializer.deserialize(rawMessage);
            const callback = this.routingMap.get(id);
            if (!callback) {
                return;
            }
            if (err || isDisposed) {
                return callback({
                    err,
                    response,
                    isDisposed,
                });
            }
            callback({
                err,
                response,
            });
        };
    }
    getConsumerAssignments() {
        return this.consumerAssignments;
    }
    async dispatchEvent(packet) {
        const pattern = this.normalizePattern(packet.pattern);
        const outgoingEvent = await this.serializer.serialize(packet.data, {
            pattern,
        });
        const message = Object.assign({
            topic: pattern,
            messages: [outgoingEvent],
        }, this.options.send || {});
        return this.producer.send(message);
    }
    getReplyTopicPartition(topic) {
        const minimumPartition = this.consumerAssignments[topic];
        if ((0, shared_utils_1.isUndefined)(minimumPartition)) {
            throw new invalid_kafka_client_topic_exception_1.InvalidKafkaClientTopicException(topic);
        }
        // get the minimum partition
        return minimumPartition.toString();
    }
    publish(partialPacket, callback) {
        const packet = this.assignPacketId(partialPacket);
        this.routingMap.set(packet.id, callback);
        const cleanup = () => this.routingMap.delete(packet.id);
        const errorCallback = (err) => {
            cleanup();
            callback({ err });
        };
        try {
            const pattern = this.normalizePattern(partialPacket.pattern);
            const replyTopic = this.getResponsePatternName(pattern);
            const replyPartition = this.getReplyTopicPartition(replyTopic);
            Promise.resolve(this.serializer.serialize(packet.data, { pattern }))
                .then((serializedPacket) => {
                serializedPacket.headers[enums_1.KafkaHeaders.CORRELATION_ID] = packet.id;
                serializedPacket.headers[enums_1.KafkaHeaders.REPLY_TOPIC] = replyTopic;
                serializedPacket.headers[enums_1.KafkaHeaders.REPLY_PARTITION] =
                    replyPartition;
                const message = Object.assign({
                    topic: pattern,
                    messages: [serializedPacket],
                }, this.options.send || {});
                return this.producer.send(message);
            })
                .catch(err => errorCallback(err));
            return cleanup;
        }
        catch (err) {
            errorCallback(err);
        }
    }
    getResponsePatternName(pattern) {
        return `${pattern}.reply`;
    }
    setConsumerAssignments(data) {
        const consumerAssignments = {};
        // only need to set the minimum
        Object.keys(data.payload.memberAssignment).forEach(topic => {
            const memberPartitions = data.payload.memberAssignment[topic];
            if (memberPartitions.length) {
                consumerAssignments[topic] = Math.min(...memberPartitions);
            }
        });
        this.consumerAssignments = consumerAssignments;
    }
    initializeSerializer(options) {
        this.serializer =
            (options && options.serializer) || new kafka_request_serializer_1.KafkaRequestSerializer();
    }
    initializeDeserializer(options) {
        this.deserializer =
            (options && options.deserializer) || new kafka_response_deserializer_1.KafkaResponseDeserializer();
    }
    commitOffsets(topicPartitions) {
        if (this.consumer) {
            return this.consumer.commitOffsets(topicPartitions);
        }
        else {
            throw new Error('No consumer initialized');
        }
    }
}
exports.ClientKafka = ClientKafka;
