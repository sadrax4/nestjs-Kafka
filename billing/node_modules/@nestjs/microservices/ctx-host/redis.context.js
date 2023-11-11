"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisContext = void 0;
const base_rpc_context_1 = require("./base-rpc.context");
class RedisContext extends base_rpc_context_1.BaseRpcContext {
    constructor(args) {
        super(args);
    }
    /**
     * Returns the name of the channel.
     */
    getChannel() {
        return this.args[0];
    }
}
exports.RedisContext = RedisContext;
