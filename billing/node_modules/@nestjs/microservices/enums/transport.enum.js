"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transport = void 0;
var Transport;
(function (Transport) {
    Transport[Transport["TCP"] = 0] = "TCP";
    Transport[Transport["REDIS"] = 1] = "REDIS";
    Transport[Transport["NATS"] = 2] = "NATS";
    Transport[Transport["MQTT"] = 3] = "MQTT";
    Transport[Transport["GRPC"] = 4] = "GRPC";
    Transport[Transport["RMQ"] = 5] = "RMQ";
    Transport[Transport["KAFKA"] = 6] = "KAFKA";
})(Transport || (exports.Transport = Transport = {}));
