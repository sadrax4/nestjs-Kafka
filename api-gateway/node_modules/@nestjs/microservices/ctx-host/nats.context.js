"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NatsContext = void 0;
const base_rpc_context_1 = require("./base-rpc.context");
class NatsContext extends base_rpc_context_1.BaseRpcContext {
    constructor(args) {
        super(args);
    }
    /**
     * Returns the name of the subject.
     */
    getSubject() {
        return this.args[0];
    }
    /**
     * Returns message headers (if exist).
     */
    getHeaders() {
        return this.args[1];
    }
}
exports.NatsContext = NatsContext;
