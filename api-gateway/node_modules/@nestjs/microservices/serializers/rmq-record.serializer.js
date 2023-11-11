"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RmqRecordSerializer = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const record_builders_1 = require("../record-builders");
class RmqRecordSerializer {
    serialize(packet) {
        if (packet?.data &&
            (0, shared_utils_1.isObject)(packet.data) &&
            packet.data instanceof record_builders_1.RmqRecord) {
            const record = packet.data;
            return {
                ...packet,
                data: record.data,
                options: record.options,
            };
        }
        return packet;
    }
}
exports.RmqRecordSerializer = RmqRecordSerializer;
