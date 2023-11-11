"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidKafkaClientTopicException = void 0;
const runtime_exception_1 = require("@nestjs/core/errors/exceptions/runtime.exception");
/**
 * @publicApi
 */
class InvalidKafkaClientTopicException extends runtime_exception_1.RuntimeException {
    constructor(topic) {
        super(`The client consumer did not subscribe to the corresponding reply topic (${topic}).`);
    }
}
exports.InvalidKafkaClientTopicException = InvalidKafkaClientTopicException;
