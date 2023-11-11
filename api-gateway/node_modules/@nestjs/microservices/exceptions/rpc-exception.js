"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcException = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
/**
 * @publicApi
 */
class RpcException extends Error {
    constructor(error) {
        super();
        this.error = error;
        this.initMessage();
    }
    initMessage() {
        if ((0, shared_utils_1.isString)(this.error)) {
            this.message = this.error;
        }
        else if ((0, shared_utils_1.isObject)(this.error) &&
            (0, shared_utils_1.isString)(this.error.message)) {
            this.message = this.error.message;
        }
        else if (this.constructor) {
            this.message = this.constructor.name
                .match(/[A-Z][a-z]+|[0-9]+/g)
                .join(' ');
        }
    }
    getError() {
        return this.error;
    }
}
exports.RpcException = RpcException;
