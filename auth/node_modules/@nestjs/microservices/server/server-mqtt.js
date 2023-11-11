"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerMqtt = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const constants_1 = require("../constants");
const mqtt_context_1 = require("../ctx-host/mqtt.context");
const enums_1 = require("../enums");
const mqtt_record_serializer_1 = require("../serializers/mqtt-record.serializer");
const server_1 = require("./server");
let mqttPackage = {};
class ServerMqtt extends server_1.Server {
    constructor(options) {
        super();
        this.options = options;
        this.transportId = enums_1.Transport.MQTT;
        this.url = this.getOptionsProp(options, 'url') || constants_1.MQTT_DEFAULT_URL;
        mqttPackage = this.loadPackage('mqtt', ServerMqtt.name, () => require('mqtt'));
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    async listen(callback) {
        try {
            this.mqttClient = this.createMqttClient();
            this.start(callback);
        }
        catch (err) {
            callback(err);
        }
    }
    start(callback) {
        this.handleError(this.mqttClient);
        this.bindEvents(this.mqttClient);
        this.mqttClient.on(constants_1.CONNECT_EVENT, () => callback());
    }
    bindEvents(mqttClient) {
        mqttClient.on(constants_1.MESSAGE_EVENT, this.getMessageHandler(mqttClient).bind(this));
        const registeredPatterns = [...this.messageHandlers.keys()];
        registeredPatterns.forEach(pattern => {
            const { isEventHandler } = this.messageHandlers.get(pattern);
            mqttClient.subscribe(isEventHandler ? pattern : this.getRequestPattern(pattern), this.getOptionsProp(this.options, 'subscribeOptions'));
        });
    }
    close() {
        this.mqttClient && this.mqttClient.end();
    }
    createMqttClient() {
        return mqttPackage.connect(this.url, this.options);
    }
    getMessageHandler(pub) {
        return async (channel, buffer, originalPacket) => this.handleMessage(channel, buffer, pub, originalPacket);
    }
    async handleMessage(channel, buffer, pub, originalPacket) {
        const rawPacket = this.parseMessage(buffer.toString());
        const packet = await this.deserializer.deserialize(rawPacket, { channel });
        const mqttContext = new mqtt_context_1.MqttContext([channel, originalPacket]);
        if ((0, shared_utils_1.isUndefined)(packet.id)) {
            return this.handleEvent(channel, packet, mqttContext);
        }
        const publish = this.getPublisher(pub, channel, packet.id);
        const handler = this.getHandlerByPattern(channel);
        if (!handler) {
            const status = 'error';
            const noHandlerPacket = {
                id: packet.id,
                status,
                err: constants_1.NO_MESSAGE_HANDLER,
            };
            return publish(noHandlerPacket);
        }
        const response$ = this.transformToObservable(await handler(packet.data, mqttContext));
        response$ && this.send(response$, publish);
    }
    getPublisher(client, pattern, id) {
        return (response) => {
            Object.assign(response, { id });
            const outgoingResponse = this.serializer.serialize(response);
            const options = outgoingResponse.options;
            delete outgoingResponse.options;
            return client.publish(this.getReplyPattern(pattern), JSON.stringify(outgoingResponse), options);
        };
    }
    parseMessage(content) {
        try {
            return JSON.parse(content);
        }
        catch (e) {
            return content;
        }
    }
    matchMqttPattern(pattern, topic) {
        const patternSegments = pattern.split(constants_1.MQTT_SEPARATOR);
        const topicSegments = topic.split(constants_1.MQTT_SEPARATOR);
        const patternSegmentsLength = patternSegments.length;
        const topicSegmentsLength = topicSegments.length;
        const lastIndex = patternSegmentsLength - 1;
        for (let i = 0; i < patternSegmentsLength; i++) {
            const currentPattern = patternSegments[i];
            const patternChar = currentPattern[0];
            const currentTopic = topicSegments[i];
            if (!currentTopic && !currentPattern) {
                continue;
            }
            if (!currentTopic && currentPattern !== constants_1.MQTT_WILDCARD_ALL) {
                return false;
            }
            if (patternChar === constants_1.MQTT_WILDCARD_ALL) {
                return i === lastIndex;
            }
            if (patternChar !== constants_1.MQTT_WILDCARD_SINGLE &&
                currentPattern !== currentTopic) {
                return false;
            }
        }
        return patternSegmentsLength === topicSegmentsLength;
    }
    getHandlerByPattern(pattern) {
        const route = this.getRouteFromPattern(pattern);
        if (this.messageHandlers.has(route)) {
            return this.messageHandlers.get(route) || null;
        }
        for (const [key, value] of this.messageHandlers) {
            const keyWithoutSharedPrefix = this.removeHandlerKeySharedPrefix(key);
            if (this.matchMqttPattern(keyWithoutSharedPrefix, route)) {
                return value;
            }
        }
        return null;
    }
    removeHandlerKeySharedPrefix(handlerKey) {
        return handlerKey && handlerKey.startsWith('$share')
            ? handlerKey.split('/').slice(2).join('/')
            : handlerKey;
    }
    getRequestPattern(pattern) {
        return pattern;
    }
    getReplyPattern(pattern) {
        return `${pattern}/reply`;
    }
    handleError(stream) {
        stream.on(constants_1.ERROR_EVENT, (err) => this.logger.error(err));
    }
    initializeSerializer(options) {
        this.serializer = options?.serializer ?? new mqtt_record_serializer_1.MqttRecordSerializer();
    }
}
exports.ServerMqtt = ServerMqtt;
