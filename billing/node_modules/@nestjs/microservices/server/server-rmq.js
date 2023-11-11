"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerRMQ = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const constants_1 = require("../constants");
const ctx_host_1 = require("../ctx-host");
const enums_1 = require("../enums");
const rmq_record_serializer_1 = require("../serializers/rmq-record.serializer");
const server_1 = require("./server");
let rqmPackage = {};
const INFINITE_CONNECTION_ATTEMPTS = -1;
class ServerRMQ extends server_1.Server {
    constructor(options) {
        super();
        this.options = options;
        this.transportId = enums_1.Transport.RMQ;
        this.server = null;
        this.channel = null;
        this.connectionAttempts = 0;
        this.urls = this.getOptionsProp(this.options, 'urls') || [constants_1.RQM_DEFAULT_URL];
        this.queue =
            this.getOptionsProp(this.options, 'queue') || constants_1.RQM_DEFAULT_QUEUE;
        this.prefetchCount =
            this.getOptionsProp(this.options, 'prefetchCount') ||
                constants_1.RQM_DEFAULT_PREFETCH_COUNT;
        this.noAck = this.getOptionsProp(this.options, 'noAck', constants_1.RQM_DEFAULT_NOACK);
        this.isGlobalPrefetchCount =
            this.getOptionsProp(this.options, 'isGlobalPrefetchCount') ||
                constants_1.RQM_DEFAULT_IS_GLOBAL_PREFETCH_COUNT;
        this.queueOptions =
            this.getOptionsProp(this.options, 'queueOptions') ||
                constants_1.RQM_DEFAULT_QUEUE_OPTIONS;
        this.noAssert =
            this.getOptionsProp(this.options, 'noAssert') || constants_1.RQM_DEFAULT_NO_ASSERT;
        this.loadPackage('amqplib', ServerRMQ.name, () => require('amqplib'));
        rqmPackage = this.loadPackage('amqp-connection-manager', ServerRMQ.name, () => require('amqp-connection-manager'));
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    async listen(callback) {
        try {
            await this.start(callback);
        }
        catch (err) {
            callback(err);
        }
    }
    close() {
        this.channel && this.channel.close();
        this.server && this.server.close();
    }
    async start(callback) {
        this.server = this.createClient();
        this.server.on(constants_1.CONNECT_EVENT, () => {
            if (this.channel) {
                return;
            }
            this.channel = this.server.createChannel({
                json: false,
                setup: (channel) => this.setupChannel(channel, callback),
            });
        });
        const maxConnectionAttempts = this.getOptionsProp(this.options, 'maxConnectionAttempts', INFINITE_CONNECTION_ATTEMPTS);
        this.server.on(constants_1.DISCONNECT_EVENT, (err) => {
            this.logger.error(constants_1.DISCONNECTED_RMQ_MESSAGE);
            this.logger.error(err);
        });
        this.server.on(constants_1.CONNECT_FAILED_EVENT, (error) => {
            this.logger.error(constants_1.CONNECTION_FAILED_MESSAGE);
            if (error?.err) {
                this.logger.error(error.err);
            }
            const isReconnecting = !!this.channel;
            if (maxConnectionAttempts === INFINITE_CONNECTION_ATTEMPTS ||
                isReconnecting) {
                return;
            }
            if (++this.connectionAttempts === maxConnectionAttempts) {
                this.close();
                callback?.(error.err ?? new Error(constants_1.CONNECTION_FAILED_MESSAGE));
            }
        });
    }
    createClient() {
        const socketOptions = this.getOptionsProp(this.options, 'socketOptions');
        return rqmPackage.connect(this.urls, {
            connectionOptions: socketOptions,
            heartbeatIntervalInSeconds: socketOptions?.heartbeatIntervalInSeconds,
            reconnectTimeInSeconds: socketOptions?.reconnectTimeInSeconds,
        });
    }
    async setupChannel(channel, callback) {
        if (!this.queueOptions.noAssert) {
            await channel.assertQueue(this.queue, this.queueOptions);
        }
        await channel.prefetch(this.prefetchCount, this.isGlobalPrefetchCount);
        channel.consume(this.queue, (msg) => this.handleMessage(msg, channel), {
            noAck: this.noAck,
        });
        callback();
    }
    async handleMessage(message, channel) {
        if ((0, shared_utils_1.isNil)(message)) {
            return;
        }
        const { content, properties } = message;
        const rawMessage = this.parseMessageContent(content);
        const packet = await this.deserializer.deserialize(rawMessage, properties);
        const pattern = (0, shared_utils_1.isString)(packet.pattern)
            ? packet.pattern
            : JSON.stringify(packet.pattern);
        const rmqContext = new ctx_host_1.RmqContext([message, channel, pattern]);
        if ((0, shared_utils_1.isUndefined)(packet.id)) {
            return this.handleEvent(pattern, packet, rmqContext);
        }
        const handler = this.getHandlerByPattern(pattern);
        if (!handler) {
            const status = 'error';
            const noHandlerPacket = {
                id: packet.id,
                err: constants_1.NO_MESSAGE_HANDLER,
                status,
            };
            return this.sendMessage(noHandlerPacket, properties.replyTo, properties.correlationId);
        }
        const response$ = this.transformToObservable(await handler(packet.data, rmqContext));
        const publish = (data) => this.sendMessage(data, properties.replyTo, properties.correlationId);
        response$ && this.send(response$, publish);
    }
    async handleEvent(pattern, packet, context) {
        const handler = this.getHandlerByPattern(pattern);
        if (!handler && !this.noAck) {
            this.channel.nack(context.getMessage(), false, false);
            return this.logger.warn((0, constants_1.RQM_NO_EVENT_HANDLER) `${pattern}`);
        }
        return super.handleEvent(pattern, packet, context);
    }
    sendMessage(message, replyTo, correlationId) {
        const outgoingResponse = this.serializer.serialize(message);
        const options = outgoingResponse.options;
        delete outgoingResponse.options;
        const buffer = Buffer.from(JSON.stringify(outgoingResponse));
        this.channel.sendToQueue(replyTo, buffer, { correlationId, ...options });
    }
    initializeSerializer(options) {
        this.serializer = options?.serializer ?? new rmq_record_serializer_1.RmqRecordSerializer();
    }
    parseMessageContent(content) {
        try {
            return JSON.parse(content.toString());
        }
        catch {
            return content.toString();
        }
    }
}
exports.ServerRMQ = ServerRMQ;
