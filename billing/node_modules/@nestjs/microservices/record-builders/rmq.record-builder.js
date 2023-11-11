"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RmqRecordBuilder = exports.RmqRecord = void 0;
class RmqRecord {
    constructor(data, options) {
        this.data = data;
        this.options = options;
    }
}
exports.RmqRecord = RmqRecord;
class RmqRecordBuilder {
    constructor(data) {
        this.data = data;
    }
    setOptions(options) {
        this.options = options;
        return this;
    }
    setData(data) {
        this.data = data;
        return this;
    }
    build() {
        return new RmqRecord(this.data, this.options);
    }
}
exports.RmqRecordBuilder = RmqRecordBuilder;
