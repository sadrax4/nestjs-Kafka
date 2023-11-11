"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRpcContext = void 0;
class BaseRpcContext {
    constructor(args) {
        this.args = args;
    }
    /**
     * Returns the array of arguments being passed to the handler.
     */
    getArgs() {
        return this.args;
    }
    /**
     * Returns a particular argument by index.
     * @param index index of argument to retrieve
     */
    getArgByIndex(index) {
        return this.args[index];
    }
}
exports.BaseRpcContext = BaseRpcContext;
