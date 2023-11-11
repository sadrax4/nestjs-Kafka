"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorruptedPacketLengthException = void 0;
/**
 * @publicApi
 */
class CorruptedPacketLengthException extends Error {
    constructor(rawContentLength) {
        super(`Corrupted length value "${rawContentLength}" supplied in a packet`);
    }
}
exports.CorruptedPacketLengthException = CorruptedPacketLengthException;
