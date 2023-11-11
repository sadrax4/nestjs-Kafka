"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContextHost = void 0;
/**
 * @publicApi
 */
class RequestContextHost {
    constructor(pattern, data, context) {
        this.pattern = pattern;
        this.data = data;
        this.context = context;
    }
    static create(pattern, data, context) {
        const host = new RequestContextHost(pattern, data, context);
        return host;
    }
    getData() {
        return this.data;
    }
    getPattern() {
        return this.pattern;
    }
    getContext() {
        return this.context;
    }
}
exports.RequestContextHost = RequestContextHost;
