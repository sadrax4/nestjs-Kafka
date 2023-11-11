"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaParser = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
class KafkaParser {
    constructor(config) {
        this.keepBinary = (config && config.keepBinary) || false;
    }
    parse(data) {
        // Clone object to as modifying the original one would break KafkaJS retries
        const result = {
            ...data,
            headers: { ...data.headers },
        };
        if (!this.keepBinary) {
            result.value = this.decode(data.value);
        }
        if (!(0, shared_utils_1.isNil)(data.key)) {
            result.key = this.decode(data.key);
        }
        if (!(0, shared_utils_1.isNil)(data.headers)) {
            const decodeHeaderByKey = (key) => {
                result.headers[key] = this.decode(data.headers[key]);
            };
            Object.keys(data.headers).forEach(decodeHeaderByKey);
        }
        else {
            result.headers = {};
        }
        return result;
    }
    decode(value) {
        if ((0, shared_utils_1.isNil)(value)) {
            return null;
        }
        // A value with the "leading zero byte" indicates the schema payload.
        // The "content" is possibly binary and should not be touched & parsed.
        if (Buffer.isBuffer(value) &&
            value.length > 0 &&
            value.readUInt8(0) === 0) {
            return value;
        }
        let result = value.toString();
        const startChar = result.charAt(0);
        // only try to parse objects and arrays
        if (startChar === '{' || startChar === '[') {
            try {
                result = JSON.parse(value.toString());
            }
            catch (e) { }
        }
        return result;
    }
}
exports.KafkaParser = KafkaParser;
