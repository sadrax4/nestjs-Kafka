"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NatsRecordBuilder = exports.NatsRecord = void 0;
class NatsRecord {
    constructor(data, headers) {
        this.data = data;
        this.headers = headers;
    }
}
exports.NatsRecord = NatsRecord;
class NatsRecordBuilder {
    constructor(data) {
        this.data = data;
    }
    setHeaders(headers) {
        this.headers = headers;
        return this;
    }
    setData(data) {
        this.data = data;
        return this;
    }
    build() {
        return new NatsRecord(this.data, this.headers);
    }
}
exports.NatsRecordBuilder = NatsRecordBuilder;
