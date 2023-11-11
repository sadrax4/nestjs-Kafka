"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TcpSocket = void 0;
const constants_1 = require("../constants");
const net_socket_closed_exception_1 = require("../errors/net-socket-closed.exception");
const invalid_json_format_exception_1 = require("../errors/invalid-json-format.exception");
class TcpSocket {
    get netSocket() {
        return this.socket;
    }
    constructor(socket) {
        this.socket = socket;
        this.isClosed = false;
        this.socket.on(constants_1.DATA_EVENT, this.onData.bind(this));
        this.socket.on(constants_1.CONNECT_EVENT, () => (this.isClosed = false));
        this.socket.on(constants_1.CLOSE_EVENT, () => (this.isClosed = true));
        this.socket.on(constants_1.ERROR_EVENT, () => (this.isClosed = true));
    }
    connect(port, host) {
        this.socket.connect(port, host);
        return this;
    }
    on(event, callback) {
        this.socket.on(event, callback);
        return this;
    }
    once(event, callback) {
        this.socket.once(event, callback);
        return this;
    }
    end() {
        this.socket.end();
        return this;
    }
    sendMessage(message, callback) {
        if (this.isClosed) {
            callback && callback(new net_socket_closed_exception_1.NetSocketClosedException());
            return;
        }
        this.handleSend(message, callback);
    }
    onData(data) {
        try {
            this.handleData(data);
        }
        catch (e) {
            this.socket.emit(constants_1.ERROR_EVENT, e.message);
            this.socket.end();
        }
    }
    emitMessage(data) {
        let message;
        try {
            message = JSON.parse(data);
        }
        catch (e) {
            throw new invalid_json_format_exception_1.InvalidJSONFormatException(e, data);
        }
        message = message || {};
        this.socket.emit(constants_1.MESSAGE_EVENT, message);
    }
}
exports.TcpSocket = TcpSocket;
