"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RmqContext = void 0;
const base_rpc_context_1 = require("./base-rpc.context");
class RmqContext extends base_rpc_context_1.BaseRpcContext {
    constructor(args) {
        super(args);
    }
    /**
     * Returns the original message (with properties, fields, and content).
     */
    getMessage() {
        return this.args[0];
    }
    /**
     * Returns the reference to the original RMQ channel.
     */
    getChannelRef() {
        return this.args[1];
    }
    /**
     * Returns the name of the pattern.
     */
    getPattern() {
        return this.args[2];
    }
}
exports.RmqContext = RmqContext;
