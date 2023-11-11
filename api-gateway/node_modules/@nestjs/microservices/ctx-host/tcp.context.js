"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpContext = void 0;
const base_rpc_context_1 = require("./base-rpc.context");
class TcpContext extends base_rpc_context_1.BaseRpcContext {
    constructor(args) {
        super(args);
    }
    /**
     * Returns the underlying JSON socket.
     */
    getSocketRef() {
        return this.args[0];
    }
    /**
     * Returns the name of the pattern.
     */
    getPattern() {
        return this.args[1];
    }
}
exports.TcpContext = TcpContext;
