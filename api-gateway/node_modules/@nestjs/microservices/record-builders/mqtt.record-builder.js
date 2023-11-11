"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttRecordBuilder = exports.MqttRecord = void 0;
class MqttRecord {
    constructor(data, options) {
        this.data = data;
        this.options = options;
    }
}
exports.MqttRecord = MqttRecord;
class MqttRecordBuilder {
    constructor(data) {
        this.data = data;
    }
    setData(data) {
        this.data = data;
        return this;
    }
    setQoS(qos) {
        this.options = {
            ...this.options,
            qos,
        };
        return this;
    }
    setRetain(retain) {
        this.options = {
            ...this.options,
            retain,
        };
        return this;
    }
    setDup(dup) {
        this.options = {
            ...this.options,
            dup,
        };
        return this;
    }
    setProperties(properties) {
        this.options = {
            ...this.options,
            properties,
        };
        return this;
    }
    build() {
        return new MqttRecord(this.data, this.options);
    }
}
exports.MqttRecordBuilder = MqttRecordBuilder;
