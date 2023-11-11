"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaRetriableException = void 0;
const rpc_exception_1 = require("./rpc-exception");
/**
 * Exception that instructs Kafka driver to instead of introspecting
 * error processing flow and sending serialized error message to the consumer,
 * force bubble it up to the "eachMessage" callback of the underlying "kafkajs" package
 * (even if interceptors are applied, or an observable stream is returned from the message handler).
 *
 * A transient exception that if retried may succeed.
 *
 * @publicApi
 */
class KafkaRetriableException extends rpc_exception_1.RpcException {
    getError() {
        return this;
    }
}
exports.KafkaRetriableException = KafkaRetriableException;
