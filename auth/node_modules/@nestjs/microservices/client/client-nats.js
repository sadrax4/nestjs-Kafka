"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientNats = void 0;
const logger_service_1 = require("@nestjs/common/services/logger.service");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const constants_1 = require("../constants");
const nats_response_json_deserializer_1 = require("../deserializers/nats-response-json.deserializer");
const empty_response_exception_1 = require("../errors/empty-response.exception");
const nats_record_serializer_1 = require("../serializers/nats-record.serializer");
const client_proxy_1 = require("./client-proxy");
let natsPackage = {};
/**
 * @publicApi
 */
class ClientNats extends client_proxy_1.ClientProxy {
    constructor(options) {
        super();
        this.options = options;
        this.logger = new logger_service_1.Logger(ClientNats.name);
        natsPackage = (0, load_package_util_1.loadPackage)('nats', ClientNats.name, () => require('nats'));
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    async close() {
        await this.natsClient?.close();
        this.natsClient = null;
    }
    async connect() {
        if (this.natsClient) {
            return this.natsClient;
        }
        this.natsClient = await this.createClient();
        this.handleStatusUpdates(this.natsClient);
        return this.natsClient;
    }
    createClient() {
        const options = this.options || {};
        return natsPackage.connect({
            servers: constants_1.NATS_DEFAULT_URL,
            ...options,
        });
    }
    async handleStatusUpdates(client) {
        for await (const status of client.status()) {
            const data = status.data && (0, shared_utils_1.isObject)(status.data)
                ? JSON.stringify(status.data)
                : status.data;
            switch (status.type) {
                case 'error':
                case 'disconnect':
                    this.logger.error(`NatsError: type: "${status.type}", data: "${data}".`);
                    break;
                case 'pingTimer':
                    if (this.options.debug) {
                        this.logger.debug(`NatsStatus: type: "${status.type}", data: "${data}".`);
                    }
                    break;
                default:
                    this.logger.log(`NatsStatus: type: "${status.type}", data: "${data}".`);
                    break;
            }
        }
    }
    createSubscriptionHandler(packet, callback) {
        return async (error, natsMsg) => {
            if (error) {
                return callback({
                    err: error,
                });
            }
            const rawPacket = natsMsg.data;
            if (rawPacket?.length === 0) {
                return callback({
                    err: new empty_response_exception_1.EmptyResponseException(this.normalizePattern(packet.pattern)),
                    isDisposed: true,
                });
            }
            const message = await this.deserializer.deserialize(rawPacket);
            if (message.id && message.id !== packet.id) {
                return undefined;
            }
            const { err, response, isDisposed } = message;
            if (isDisposed || err) {
                return callback({
                    err,
                    response,
                    isDisposed: true,
                });
            }
            callback({
                err,
                response,
            });
        };
    }
    publish(partialPacket, callback) {
        try {
            const packet = this.assignPacketId(partialPacket);
            const channel = this.normalizePattern(partialPacket.pattern);
            const serializedPacket = this.serializer.serialize(packet);
            const inbox = natsPackage.createInbox();
            const subscriptionHandler = this.createSubscriptionHandler(packet, callback);
            const subscription = this.natsClient.subscribe(inbox, {
                callback: subscriptionHandler,
            });
            const headers = this.mergeHeaders(serializedPacket.headers);
            this.natsClient.publish(channel, serializedPacket.data, {
                reply: inbox,
                headers,
            });
            return () => subscription.unsubscribe();
        }
        catch (err) {
            callback({ err });
        }
    }
    dispatchEvent(packet) {
        const pattern = this.normalizePattern(packet.pattern);
        const serializedPacket = this.serializer.serialize(packet);
        const headers = this.mergeHeaders(serializedPacket.headers);
        return new Promise((resolve, reject) => {
            try {
                this.natsClient.publish(pattern, serializedPacket.data, {
                    headers,
                });
                resolve();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    initializeSerializer(options) {
        this.serializer = options?.serializer ?? new nats_record_serializer_1.NatsRecordSerializer();
    }
    initializeDeserializer(options) {
        this.deserializer =
            options?.deserializer ?? new nats_response_json_deserializer_1.NatsResponseJSONDeserializer();
    }
    mergeHeaders(requestHeaders) {
        if (!requestHeaders && !this.options?.headers) {
            return undefined;
        }
        const headers = requestHeaders ?? natsPackage.headers();
        for (const [key, value] of Object.entries(this.options?.headers || {})) {
            if (!headers.has(key)) {
                headers.set(key, value);
            }
        }
        return headers;
    }
}
exports.ClientNats = ClientNats;
