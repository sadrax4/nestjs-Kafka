"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidGrpcPackageException = void 0;
const runtime_exception_1 = require("@nestjs/core/errors/exceptions/runtime.exception");
/**
 * @publicApi
 */
class InvalidGrpcPackageException extends runtime_exception_1.RuntimeException {
    constructor(name) {
        super(`The invalid gRPC package (package "${name}" not found)`);
    }
}
exports.InvalidGrpcPackageException = InvalidGrpcPackageException;
