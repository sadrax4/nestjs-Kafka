"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientProxyFactory = void 0;
const transport_enum_1 = require("../enums/transport.enum");
const client_grpc_1 = require("./client-grpc");
const client_kafka_1 = require("./client-kafka");
const client_mqtt_1 = require("./client-mqtt");
const client_nats_1 = require("./client-nats");
const client_redis_1 = require("./client-redis");
const client_rmq_1 = require("./client-rmq");
const client_tcp_1 = require("./client-tcp");
/**
 * @publicApi
 */
class ClientProxyFactory {
    static create(clientOptions) {
        if (this.isCustomClientOptions(clientOptions)) {
            const { customClass, options } = clientOptions;
            return new customClass(options);
        }
        const { transport, options } = clientOptions || {};
        switch (transport) {
            case transport_enum_1.Transport.REDIS:
                return new client_redis_1.ClientRedis(options);
            case transport_enum_1.Transport.NATS:
                return new client_nats_1.ClientNats(options);
            case transport_enum_1.Transport.MQTT:
                return new client_mqtt_1.ClientMqtt(options);
            case transport_enum_1.Transport.GRPC:
                return new client_grpc_1.ClientGrpcProxy(options);
            case transport_enum_1.Transport.RMQ:
                return new client_rmq_1.ClientRMQ(options);
            case transport_enum_1.Transport.KAFKA:
                return new client_kafka_1.ClientKafka(options);
            default:
                return new client_tcp_1.ClientTCP(options);
        }
    }
    static isCustomClientOptions(options) {
        return !!options.customClass;
    }
}
exports.ClientProxyFactory = ClientProxyFactory;
