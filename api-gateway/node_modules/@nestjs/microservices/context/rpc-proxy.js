"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcProxy = void 0;
const execution_context_host_1 = require("@nestjs/core/helpers/execution-context-host");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
class RpcProxy {
    create(targetCallback, exceptionsHandler) {
        return async (...args) => {
            try {
                const result = await targetCallback(...args);
                return !(0, rxjs_1.isObservable)(result)
                    ? result
                    : result.pipe((0, operators_1.catchError)(error => this.handleError(exceptionsHandler, args, error)));
            }
            catch (error) {
                return this.handleError(exceptionsHandler, args, error);
            }
        };
    }
    handleError(exceptionsHandler, args, error) {
        const host = new execution_context_host_1.ExecutionContextHost(args);
        host.setType('rpc');
        return exceptionsHandler.handle(error, host);
    }
}
exports.RpcProxy = RpcProxy;
