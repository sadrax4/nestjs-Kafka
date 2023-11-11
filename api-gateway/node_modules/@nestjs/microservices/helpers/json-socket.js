"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonSocket = void 0;
const buffer_1 = require("buffer");
const string_decoder_1 = require("string_decoder");
const corrupted_packet_length_exception_1 = require("../errors/corrupted-packet-length.exception");
const tcp_socket_1 = require("./tcp-socket");
class JsonSocket extends tcp_socket_1.TcpSocket {
    constructor() {
        super(...arguments);
        this.contentLength = null;
        this.buffer = '';
        this.stringDecoder = new string_decoder_1.StringDecoder();
        this.delimiter = '#';
    }
    handleSend(message, callback) {
        this.socket.write(this.formatMessageData(message), 'utf-8', callback);
    }
    handleData(dataRaw) {
        const data = buffer_1.Buffer.isBuffer(dataRaw)
            ? this.stringDecoder.write(dataRaw)
            : dataRaw;
        this.buffer += data;
        if (this.contentLength == null) {
            const i = this.buffer.indexOf(this.delimiter);
            /**
             * Check if the buffer has the delimiter (#),
             * if not, the end of the buffer string might be in the middle of a content length string
             */
            if (i !== -1) {
                const rawContentLength = this.buffer.substring(0, i);
                this.contentLength = parseInt(rawContentLength, 10);
                if (isNaN(this.contentLength)) {
                    this.contentLength = null;
                    this.buffer = '';
                    throw new corrupted_packet_length_exception_1.CorruptedPacketLengthException(rawContentLength);
                }
                this.buffer = this.buffer.substring(i + 1);
            }
        }
        if (this.contentLength !== null) {
            const length = this.buffer.length;
            if (length === this.contentLength) {
                this.handleMessage(this.buffer);
            }
            else if (length > this.contentLength) {
                const message = this.buffer.substring(0, this.contentLength);
                const rest = this.buffer.substring(this.contentLength);
                this.handleMessage(message);
                this.handleData(rest);
            }
        }
    }
    handleMessage(message) {
        this.contentLength = null;
        this.buffer = '';
        this.emitMessage(message);
    }
    formatMessageData(message) {
        const messageData = JSON.stringify(message);
        const length = messageData.length;
        const data = length + this.delimiter + messageData;
        return data;
    }
}
exports.JsonSocket = JsonSocket;
