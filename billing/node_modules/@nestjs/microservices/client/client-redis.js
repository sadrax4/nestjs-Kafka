"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRedis = void 0;
const logger_service_1 = require("@nestjs/common/services/logger.service");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const constants_1 = require("../constants");
const client_proxy_1 = require("./client-proxy");
let redisPackage = {};
/**
 * @publicApi
 */
class ClientRedis extends client_proxy_1.ClientProxy {
    constructor(options) {
        super();
        this.options = options;
        this.logger = new logger_service_1.Logger(client_proxy_1.ClientProxy.name);
        this.subscriptionsCount = new Map();
        this.isExplicitlyTerminated = false;
        redisPackage = (0, load_package_util_1.loadPackage)('ioredis', ClientRedis.name, () => require('ioredis'));
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    getRequestPattern(pattern) {
        return pattern;
    }
    getReplyPattern(pattern) {
        return `${pattern}.reply`;
    }
    close() {
        this.pubClient && this.pubClient.quit();
        this.subClient && this.subClient.quit();
        this.pubClient = this.subClient = null;
        this.isExplicitlyTerminated = true;
    }
    async connect() {
        if (this.pubClient && this.subClient) {
            return this.connection;
        }
        this.pubClient = this.createClient();
        this.subClient = this.createClient();
        this.handleError(this.pubClient);
        this.handleError(this.subClient);
        this.connection = Promise.all([
            this.subClient.connect(),
            this.pubClient.connect(),
        ]);
        await this.connection;
        this.subClient.on(constants_1.MESSAGE_EVENT, this.createResponseCallback());
        return this.connection;
    }
    createClient() {
        return new redisPackage({
            host: constants_1.REDIS_DEFAULT_HOST,
            port: constants_1.REDIS_DEFAULT_PORT,
            ...this.getClientOptions(),
            lazyConnect: true,
        });
    }
    handleError(client) {
        client.addListener(constants_1.ERROR_EVENT, (err) => this.logger.error(err));
    }
    getClientOptions() {
        const retryStrategy = (times) => this.createRetryStrategy(times);
        return {
            ...(this.options || {}),
            retryStrategy,
        };
    }
    createRetryStrategy(times) {
        if (this.isExplicitlyTerminated) {
            return undefined;
        }
        if (!this.getOptionsProp(this.options, 'retryAttempts') ||
            times > this.getOptionsProp(this.options, 'retryAttempts')) {
            this.logger.error('Retry time exhausted');
            return;
        }
        return this.getOptionsProp(this.options, 'retryDelay') || 0;
    }
    createResponseCallback() {
        return async (channel, buffer) => {
            const packet = JSON.parse(buffer);
            const { err, response, isDisposed, id } = await this.deserializer.deserialize(packet);
            const callback = this.routingMap.get(id);
            if (!callback) {
                return;
            }
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
            const pattern = this.normalizePattern(partialPacket.pattern);
            const serializedPacket = this.serializer.serialize(packet);
            const responseChannel = this.getReplyPattern(pattern);
            let subscriptionsCount = this.subscriptionsCount.get(responseChannel) || 0;
            const publishPacket = () => {
                subscriptionsCount = this.subscriptionsCount.get(responseChannel) || 0;
                this.subscriptionsCount.set(responseChannel, subscriptionsCount + 1);
                this.routingMap.set(packet.id, callback);
                this.pubClient.publish(this.getRequestPattern(pattern), JSON.stringify(serializedPacket));
            };
            if (subscriptionsCount <= 0) {
                this.subClient.subscribe(responseChannel, (err) => !err && publishPacket());
            }
            else {
                publishPacket();
            }
            return () => {
                this.unsubscribeFromChannel(responseChannel);
                this.routingMap.delete(packet.id);
            };
        }
        catch (err) {
            callback({ err });
        }
    }
    dispatchEvent(packet) {
        const pattern = this.normalizePattern(packet.pattern);
        const serializedPacket = this.serializer.serialize(packet);
        return new Promise((resolve, reject) => this.pubClient.publish(pattern, JSON.stringify(serializedPacket), err => err ? reject(err) : resolve()));
    }
    unsubscribeFromChannel(channel) {
        const subscriptionCount = this.subscriptionsCount.get(channel);
        this.subscriptionsCount.set(channel, subscriptionCount - 1);
        if (subscriptionCount - 1 <= 0) {
            this.subClient.unsubscribe(channel);
        }
    }
}
exports.ClientRedis = ClientRedis;
