"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidProtoDefinitionException = void 0;
const runtime_exception_1 = require("@nestjs/core/errors/exceptions/runtime.exception");
/**
 * @publicApi
 */
class InvalidProtoDefinitionException extends runtime_exception_1.RuntimeException {
    constructor(path) {
        super(`The invalid .proto definition (file at "${path}" not found)`);
    }
}
exports.InvalidProtoDefinitionException = InvalidProtoDefinitionException;
