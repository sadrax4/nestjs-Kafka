"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerTCP = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const net = require("net");
const constants_1 = require("../constants");
const tcp_context_1 = require("../ctx-host/tcp.context");
const enums_1 = require("../enums");
const helpers_1 = require("../helpers");
const tls_1 = require("tls");
const server_1 = require("./server");
class ServerTCP extends server_1.Server {
    constructor(options) {
        super();
        this.options = options;
        this.transportId = enums_1.Transport.TCP;
        this.isExplicitlyTerminated = false;
        this.retryAttemptsCount = 0;
        this.port = this.getOptionsProp(options, 'port') || constants_1.TCP_DEFAULT_PORT;
        this.host = this.getOptionsProp(options, 'host') || constants_1.TCP_DEFAULT_HOST;
        this.socketClass =
            this.getOptionsProp(options, 'socketClass') || helpers_1.JsonSocket;
        this.tlsOptions = this.getOptionsProp(options, 'tlsOptions');
        this.init();
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    listen(callback) {
        this.server.once(constants_1.ERROR_EVENT, (err) => {
            if (err?.code === constants_1.EADDRINUSE || err?.code === constants_1.ECONNREFUSED) {
                return callback(err);
            }
        });
        this.server.listen(this.port, this.host, callback);
    }
    close() {
        this.isExplicitlyTerminated = true;
        this.server.close();
    }
    bindHandler(socket) {
        const readSocket = this.getSocketInstance(socket);
        readSocket.on(constants_1.MESSAGE_EVENT, async (msg) => this.handleMessage(readSocket, msg));
        readSocket.on(constants_1.ERROR_EVENT, this.handleError.bind(this));
    }
    async handleMessage(socket, rawMessage) {
        const packet = await this.deserializer.deserialize(rawMessage);
        const pattern = !(0, shared_utils_1.isString)(packet.pattern)
            ? JSON.stringify(packet.pattern)
            : packet.pattern;
        const tcpContext = new tcp_context_1.TcpContext([socket, pattern]);
        if ((0, shared_utils_1.isUndefined)(packet.id)) {
            return this.handleEvent(pattern, packet, tcpContext);
        }
        const handler = this.getHandlerByPattern(pattern);
        if (!handler) {
            const status = 'error';
            const noHandlerPacket = this.serializer.serialize({
                id: packet.id,
                status,
                err: constants_1.NO_MESSAGE_HANDLER,
            });
            return socket.sendMessage(noHandlerPacket);
        }
        const response$ = this.transformToObservable(await handler(packet.data, tcpContext));
        response$ &&
            this.send(response$, data => {
                Object.assign(data, { id: packet.id });
                const outgoingResponse = this.serializer.serialize(data);
                socket.sendMessage(outgoingResponse);
            });
    }
    handleClose() {
        if (this.isExplicitlyTerminated ||
            !this.getOptionsProp(this.options, 'retryAttempts') ||
            this.retryAttemptsCount >=
                this.getOptionsProp(this.options, 'retryAttempts')) {
            return undefined;
        }
        ++this.retryAttemptsCount;
        return setTimeout(() => this.server.listen(this.port, this.host), this.getOptionsProp(this.options, 'retryDelay') || 0);
    }
    init() {
        if (this.tlsOptions) {
            // TLS enabled, use tls server
            this.server = (0, tls_1.createServer)(this.tlsOptions, this.bindHandler.bind(this));
        }
        else {
            // TLS disabled, use net server
            this.server = net.createServer(this.bindHandler.bind(this));
        }
        this.server.on(constants_1.ERROR_EVENT, this.handleError.bind(this));
        this.server.on(constants_1.CLOSE_EVENT, this.handleClose.bind(this));
    }
    getSocketInstance(socket) {
        return new this.socketClass(socket);
    }
}
exports.ServerTCP = ServerTCP;
