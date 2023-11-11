"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRpcExceptionFilter = void 0;
/* eslint-disable prefer-spread */
const common_1 = require("@nestjs/common");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const constants_1 = require("@nestjs/core/constants");
const rxjs_1 = require("rxjs");
const rpc_exception_1 = require("./rpc-exception");
/**
 * @publicApi
 */
class BaseRpcExceptionFilter {
    catch(exception, host) {
        const status = 'error';
        if (!(exception instanceof rpc_exception_1.RpcException)) {
            return this.handleUnknownError(exception, status);
        }
        const res = exception.getError();
        const message = (0, shared_utils_1.isObject)(res) ? res : { status, message: res };
        return (0, rxjs_1.throwError)(() => message);
    }
    handleUnknownError(exception, status) {
        const errorMessage = constants_1.MESSAGES.UNKNOWN_EXCEPTION_MESSAGE;
        const loggerArgs = this.isError(exception)
            ? [exception.message, exception.stack]
            : [exception];
        const logger = BaseRpcExceptionFilter.logger;
        logger.error.apply(logger, loggerArgs);
        return (0, rxjs_1.throwError)(() => ({ status, message: errorMessage }));
    }
    isError(exception) {
        return !!((0, shared_utils_1.isObject)(exception) && exception.message);
    }
}
exports.BaseRpcExceptionFilter = BaseRpcExceptionFilter;
BaseRpcExceptionFilter.logger = new common_1.Logger('RpcExceptionsHandler');
