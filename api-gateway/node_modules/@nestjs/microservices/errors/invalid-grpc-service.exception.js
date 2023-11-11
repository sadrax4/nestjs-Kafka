"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidGrpcServiceException = void 0;
const runtime_exception_1 = require("@nestjs/core/errors/exceptions/runtime.exception");
/**
 * @publicApi
 */
class InvalidGrpcServiceException extends runtime_exception_1.RuntimeException {
    constructor(name) {
        super(`The invalid gRPC service (service "${name}" not found)`);
    }
}
exports.InvalidGrpcServiceException = InvalidGrpcServiceException;
