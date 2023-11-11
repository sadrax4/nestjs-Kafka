"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerFactory = void 0;
const transport_enum_1 = require("../enums/transport.enum");
const server_grpc_1 = require("./server-grpc");
const server_kafka_1 = require("./server-kafka");
const server_mqtt_1 = require("./server-mqtt");
const server_nats_1 = require("./server-nats");
const server_redis_1 = require("./server-redis");
const server_tcp_1 = require("./server-tcp");
const server_rmq_1 = require("./server-rmq");
class ServerFactory {
    static create(microserviceOptions) {
        const { transport, options } = microserviceOptions;
        switch (transport) {
            case transport_enum_1.Transport.REDIS:
                return new server_redis_1.ServerRedis(options);
            case transport_enum_1.Transport.NATS:
                return new server_nats_1.ServerNats(options);
            case transport_enum_1.Transport.MQTT:
                return new server_mqtt_1.ServerMqtt(options);
            case transport_enum_1.Transport.GRPC:
                return new server_grpc_1.ServerGrpc(options);
            case transport_enum_1.Transport.KAFKA:
                return new server_kafka_1.ServerKafka(options);
            case transport_enum_1.Transport.RMQ:
                return new server_rmq_1.ServerRMQ(options);
            default:
                return new server_tcp_1.ServerTCP(options);
        }
    }
}
exports.ServerFactory = ServerFactory;
