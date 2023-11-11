"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRMQ = void 0;
const logger_service_1 = require("@nestjs/common/services/logger.service");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const random_string_generator_util_1 = require("@nestjs/common/utils/random-string-generator.util");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const events_1 = require("events");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const constants_1 = require("../constants");
const rmq_record_serializer_1 = require("../serializers/rmq-record.serializer");
const client_proxy_1 = require("./client-proxy");
let rqmPackage = {};
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';
/**
 * @publicApi
 */
class ClientRMQ extends client_proxy_1.ClientProxy {
    constructor(options) {
        super();
        this.options = options;
        this.logger = new logger_service_1.Logger(client_proxy_1.ClientProxy.name);
        this.client = null;
        this.channel = null;
        this.urls = this.getOptionsProp(this.options, 'urls') || [constants_1.RQM_DEFAULT_URL];
        this.queue =
            this.getOptionsProp(this.options, 'queue') || constants_1.RQM_DEFAULT_QUEUE;
        this.queueOptions =
            this.getOptionsProp(this.options, 'queueOptions') ||
                constants_1.RQM_DEFAULT_QUEUE_OPTIONS;
        this.replyQueue =
            this.getOptionsProp(this.options, 'replyQueue') || REPLY_QUEUE;
        this.persistent =
            this.getOptionsProp(this.options, 'persistent') || constants_1.RQM_DEFAULT_PERSISTENT;
        this.noAssert =
            this.getOptionsProp(this.options, 'noAssert') || constants_1.RQM_DEFAULT_NO_ASSERT;
        (0, load_package_util_1.loadPackage)('amqplib', ClientRMQ.name, () => require('amqplib'));
        rqmPackage = (0, load_package_util_1.loadPackage)('amqp-connection-manager', ClientRMQ.name, () => require('amqp-connection-manager'));
        this.initializeSerializer(options);
        this.initializeDeserializer(options);
    }
    close() {
        this.channel && this.channel.close();
        this.client && this.client.close();
        this.channel = null;
        this.client = null;
    }
    connect() {
        if (this.client) {
            return this.convertConnectionToPromise();
        }
        this.client = this.createClient();
        this.handleError(this.client);
        this.handleDisconnectError(this.client);
        this.responseEmitter = new events_1.EventEmitter();
        this.responseEmitter.setMaxListeners(0);
        const connect$ = this.connect$(this.client);
        const withDisconnect$ = this.mergeDisconnectEvent(this.client, connect$).pipe((0, operators_1.switchMap)(() => this.createChannel()));
        const withReconnect$ = (0, rxjs_1.fromEvent)(this.client, constants_1.CONNECT_EVENT).pipe((0, operators_1.skip)(1));
        const source$ = (0, rxjs_1.merge)(withDisconnect$, withReconnect$);
        this.connection$ = new rxjs_1.ReplaySubject(1);
        source$.subscribe(this.connection$);
        return this.convertConnectionToPromise();
    }
    createChannel() {
        return new Promise(resolve => {
            this.channel = this.client.createChannel({
                json: false,
                setup: (channel) => this.setupChannel(channel, resolve),
            });
        });
    }
    createClient() {
        const socketOptions = this.getOptionsProp(this.options, 'socketOptions');
        return rqmPackage.connect(this.urls, {
            connectionOptions: socketOptions,
        });
    }
    mergeDisconnectEvent(instance, source$) {
        const eventToError = (eventType) => (0, rxjs_1.fromEvent)(instance, eventType).pipe((0, operators_1.map)((err) => {
            throw err;
        }));
        const disconnect$ = eventToError(constants_1.DISCONNECT_EVENT);
        const urls = this.getOptionsProp(this.options, 'urls', []);
        const connectFailed$ = eventToError(constants_1.CONNECT_FAILED_EVENT).pipe((0, operators_1.retryWhen)(e => e.pipe((0, operators_1.scan)((errorCount, error) => {
            if (urls.indexOf(error.url) >= urls.length - 1) {
                throw error;
            }
            return errorCount + 1;
        }, 0))));
        // If we ever decide to propagate all disconnect errors & re-emit them through
        // the "connection" stream then comment out "first()" operator.
        return (0, rxjs_1.merge)(source$, disconnect$, connectFailed$).pipe((0, operators_1.first)());
    }
    async convertConnectionToPromise() {
        try {
            return await (0, rxjs_1.firstValueFrom)(this.connection$);
        }
        catch (err) {
            if (err instanceof rxjs_1.EmptyError) {
                return;
            }
            throw err;
        }
    }
    async setupChannel(channel, resolve) {
        const prefetchCount = this.getOptionsProp(this.options, 'prefetchCount') ||
            constants_1.RQM_DEFAULT_PREFETCH_COUNT;
        const isGlobalPrefetchCount = this.getOptionsProp(this.options, 'isGlobalPrefetchCount') ||
            constants_1.RQM_DEFAULT_IS_GLOBAL_PREFETCH_COUNT;
        if (!this.queueOptions.noAssert) {
            await channel.assertQueue(this.queue, this.queueOptions);
        }
        await channel.prefetch(prefetchCount, isGlobalPrefetchCount);
        await this.consumeChannel(channel);
        resolve();
    }
    async consumeChannel(channel) {
        const noAck = this.getOptionsProp(this.options, 'noAck', constants_1.RQM_DEFAULT_NOACK);
        await channel.consume(this.replyQueue, (msg) => this.responseEmitter.emit(msg.properties.correlationId, msg), {
            noAck,
        });
    }
    handleError(client) {
        client.addListener(constants_1.ERROR_EVENT, (err) => this.logger.error(err));
    }
    handleDisconnectError(client) {
        client.addListener(constants_1.DISCONNECT_EVENT, (err) => {
            this.logger.error(constants_1.DISCONNECTED_RMQ_MESSAGE);
            this.logger.error(err);
        });
    }
    async handleMessage(packet, options, callback) {
        if ((0, shared_utils_1.isFunction)(options)) {
            callback = options;
            options = undefined;
        }
        const { err, response, isDisposed } = await this.deserializer.deserialize(packet, options);
        if (isDisposed || err) {
            callback({
                err,
                response,
                isDisposed: true,
            });
        }
        callback({
            err,
            response,
        });
    }
    publish(message, callback) {
        try {
            const correlationId = (0, random_string_generator_util_1.randomStringGenerator)();
            const listener = ({ content, options, }) => this.handleMessage(this.parseMessageContent(content), options, callback);
            Object.assign(message, { id: correlationId });
            const serializedPacket = this.serializer.serialize(message);
            const options = serializedPacket.options;
            delete serializedPacket.options;
            this.responseEmitter.on(correlationId, listener);
            this.channel
                .sendToQueue(this.queue, Buffer.from(JSON.stringify(serializedPacket)), {
                replyTo: this.replyQueue,
                persistent: this.persistent,
                ...options,
                headers: this.mergeHeaders(options?.headers),
                correlationId,
            })
                .catch(err => callback({ err }));
            return () => this.responseEmitter.removeListener(correlationId, listener);
        }
        catch (err) {
            callback({ err });
        }
    }
    dispatchEvent(packet) {
        const serializedPacket = this.serializer.serialize(packet);
        const options = serializedPacket.options;
        delete serializedPacket.options;
        return new Promise((resolve, reject) => this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(serializedPacket)), {
            persistent: this.persistent,
            ...options,
            headers: this.mergeHeaders(options?.headers),
        }, (err) => (err ? reject(err) : resolve())));
    }
    initializeSerializer(options) {
        this.serializer = options?.serializer ?? new rmq_record_serializer_1.RmqRecordSerializer();
    }
    mergeHeaders(requestHeaders) {
        if (!requestHeaders && !this.options?.headers) {
            return undefined;
        }
        return {
            ...this.options?.headers,
            ...requestHeaders,
        };
    }
    parseMessageContent(content) {
        const rawContent = content.toString();
        try {
            return JSON.parse(rawContent);
        }
        catch {
            return rawContent;
        }
    }
}
exports.ClientRMQ = ClientRMQ;
