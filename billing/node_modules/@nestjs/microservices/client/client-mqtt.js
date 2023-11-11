"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientMqtt = void 0;
const logger_service_1 = require("@nestjs/common/services/logger.service");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const constants_1 = require("../constants");
const mqtt_record_serializer_1 = require("../serializers/mqtt-record.serializer");
const client_proxy_1 = require("./client-proxy");
let mqttPackage = {};
/**
 * @publicApi
 */
class ClientMqtt extends client_proxy_1.ClientProxy {
    constructor(options) {
        super();
        this.options = options;
        this.logger = new logger_service_1.Logger(client_proxy_1.ClientProxy.name);
        this.subscriptionsCount = new Map();
        this.url = this.getOptionsProp(this.options, 'url') || constants_1.MQTT_DEFAULT_URL;
        mqttPackage = (0, load_package_util_1.loadPackage)('mqtt', ClientMqtt.name, () => require('mqtt'));
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    getRequestPattern(pattern) {
        return pattern;
    }
    getResponsePattern(pattern) {
        return `${pattern}/reply`;
    }
    close() {
        this.mqttClient && this.mqttClient.end();
        this.mqttClient = null;
        this.connection = null;
    }
    connect() {
        if (this.mqttClient) {
            return this.connection;
        }
        this.mqttClient = this.createClient();
        this.handleError(this.mqttClient);
        const connect$ = this.connect$(this.mqttClient);
        this.connection = (0, rxjs_1.lastValueFrom)(this.mergeCloseEvent(this.mqttClient, connect$).pipe((0, operators_1.tap)(() => this.mqttClient.on(constants_1.MESSAGE_EVENT, this.createResponseCallback())), (0, operators_1.share)())).catch(err => {
            if (err instanceof rxjs_1.EmptyError) {
                return;
            }
            throw err;
        });
        return this.connection;
    }
    mergeCloseEvent(instance, source$) {
        const close$ = (0, rxjs_1.fromEvent)(instance, constants_1.CLOSE_EVENT).pipe((0, operators_1.map)((err) => {
            throw err;
        }));
        return (0, rxjs_1.merge)(source$, close$).pipe((0, operators_1.first)());
    }
    createClient() {
        return mqttPackage.connect(this.url, this.options);
    }
    handleError(client) {
        client.addListener(constants_1.ERROR_EVENT, (err) => err.code !== constants_1.ECONNREFUSED && this.logger.error(err));
    }
    createResponseCallback() {
        return async (channel, buffer) => {
            const packet = JSON.parse(buffer.toString());
            const { err, response, isDisposed, id } = await this.deserializer.deserialize(packet);
            const callback = this.routingMap.get(id);
            if (!callback) {
                return undefined;
            }
            if (isDisposed || err) {
                return callback({
                    err,
                    response,
                    isDisposed: true,
                });
            }
            callback({
                err,
                response,
            });
        };
    }
    publish(partialPacket, callback) {
        try {
            const packet = this.assignPacketId(partialPacket);
            const pattern = this.normalizePattern(partialPacket.pattern);
            const serializedPacket = this.serializer.serialize(packet);
            const responseChannel = this.getResponsePattern(pattern);
            let subscriptionsCount = this.subscriptionsCount.get(responseChannel) || 0;
            const publishPacket = () => {
                subscriptionsCount = this.subscriptionsCount.get(responseChannel) || 0;
                this.subscriptionsCount.set(responseChannel, subscriptionsCount + 1);
                this.routingMap.set(packet.id, callback);
                const options = serializedPacket.options;
                delete serializedPacket.options;
                this.mqttClient.publish(this.getRequestPattern(pattern), JSON.stringify(serializedPacket), this.mergePacketOptions(options));
            };
            if (subscriptionsCount <= 0) {
                this.mqttClient.subscribe(responseChannel, (err) => !err && publishPacket());
            }
            else {
                publishPacket();
            }
            return () => {
                this.unsubscribeFromChannel(responseChannel);
                this.routingMap.delete(packet.id);
            };
        }
        catch (err) {
            callback({ err });
        }
    }
    dispatchEvent(packet) {
        const pattern = this.normalizePattern(packet.pattern);
        const serializedPacket = this.serializer.serialize(packet);
        const options = serializedPacket.options;
        delete serializedPacket.options;
        return new Promise((resolve, reject) => this.mqttClient.publish(pattern, JSON.stringify(serializedPacket), this.mergePacketOptions(options), (err) => (err ? reject(err) : resolve())));
    }
    unsubscribeFromChannel(channel) {
        const subscriptionCount = this.subscriptionsCount.get(channel);
        this.subscriptionsCount.set(channel, subscriptionCount - 1);
        if (subscriptionCount - 1 <= 0) {
            this.mqttClient.unsubscribe(channel);
        }
    }
    initializeSerializer(options) {
        this.serializer = options?.serializer ?? new mqtt_record_serializer_1.MqttRecordSerializer();
    }
    mergePacketOptions(requestOptions) {
        if (!requestOptions && !this.options?.userProperties) {
            return undefined;
        }
        return {
            ...requestOptions,
            properties: {
                ...requestOptions?.properties,
                userProperties: {
                    ...this.options?.userProperties,
                    ...requestOptions?.properties?.userProperties,
                },
            },
        };
    }
}
exports.ClientMqtt = ClientMqtt;
