"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const logger_service_1 = require("@nestjs/common/services/logger.service");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const constants_1 = require("../constants");
const incoming_request_deserializer_1 = require("../deserializers/incoming-request.deserializer");
const identity_serializer_1 = require("../serializers/identity.serializer");
const utils_1 = require("../utils");
class Server {
    constructor() {
        this.messageHandlers = new Map();
        this.logger = new logger_service_1.Logger(Server.name);
    }
    addHandler(pattern, callback, isEventHandler = false, extras = {}) {
        const normalizedPattern = this.normalizePattern(pattern);
        callback.isEventHandler = isEventHandler;
        callback.extras = extras;
        if (this.messageHandlers.has(normalizedPattern) && isEventHandler) {
            const headRef = this.messageHandlers.get(normalizedPattern);
            const getTail = (handler) => handler?.next ? getTail(handler.next) : handler;
            const tailRef = getTail(headRef);
            tailRef.next = callback;
        }
        else {
            this.messageHandlers.set(normalizedPattern, callback);
        }
    }
    getHandlers() {
        return this.messageHandlers;
    }
    getHandlerByPattern(pattern) {
        const route = this.getRouteFromPattern(pattern);
        return this.messageHandlers.has(route)
            ? this.messageHandlers.get(route)
            : null;
    }
    send(stream$, respond) {
        let dataBuffer = null;
        const scheduleOnNextTick = (data) => {
            if (!dataBuffer) {
                dataBuffer = [data];
                process.nextTick(async () => {
                    for (const item of dataBuffer) {
                        await respond(item);
                    }
                    dataBuffer = null;
                });
            }
            else if (!data.isDisposed) {
                dataBuffer = dataBuffer.concat(data);
            }
            else {
                dataBuffer[dataBuffer.length - 1].isDisposed = data.isDisposed;
            }
        };
        return stream$
            .pipe((0, operators_1.catchError)((err) => {
            scheduleOnNextTick({ err });
            return rxjs_1.EMPTY;
        }), (0, operators_1.finalize)(() => scheduleOnNextTick({ isDisposed: true })))
            .subscribe((response) => scheduleOnNextTick({ response }));
    }
    async handleEvent(pattern, packet, context) {
        const handler = this.getHandlerByPattern(pattern);
        if (!handler) {
            return this.logger.error((0, constants_1.NO_EVENT_HANDLER) `${pattern}`);
        }
        const resultOrStream = await handler(packet.data, context);
        if ((0, rxjs_1.isObservable)(resultOrStream)) {
            const connectableSource = (0, rxjs_1.connectable)(resultOrStream, {
                connector: () => new rxjs_1.Subject(),
                resetOnDisconnect: false,
            });
            connectableSource.connect();
        }
    }
    transformToObservable(resultOrDeferred) {
        if (resultOrDeferred instanceof Promise) {
            return (0, rxjs_1.from)(resultOrDeferred).pipe((0, operators_1.mergeMap)(val => ((0, rxjs_1.isObservable)(val) ? val : (0, rxjs_1.of)(val))));
        }
        if ((0, rxjs_1.isObservable)(resultOrDeferred)) {
            return resultOrDeferred;
        }
        return (0, rxjs_1.of)(resultOrDeferred);
    }
    getOptionsProp(obj, prop, defaultValue = undefined) {
        return obj && prop in obj ? obj[prop] : defaultValue;
    }
    handleError(error) {
        this.logger.error(error);
    }
    loadPackage(name, ctx, loader) {
        return (0, load_package_util_1.loadPackage)(name, ctx, loader);
    }
    initializeSerializer(options) {
        this.serializer =
            (options &&
                options.serializer) ||
                new identity_serializer_1.IdentitySerializer();
    }
    initializeDeserializer(options) {
        this.deserializer =
            (options &&
                options.deserializer) ||
                new incoming_request_deserializer_1.IncomingRequestDeserializer();
    }
    /**
     * Transforms the server Pattern to valid type and returns a route for him.
     *
     * @param  {string} pattern - server pattern
     * @returns string
     */
    getRouteFromPattern(pattern) {
        let validPattern;
        try {
            validPattern = JSON.parse(pattern);
        }
        catch (error) {
            // Uses a fundamental object (`pattern` variable without any conversion)
            validPattern = pattern;
        }
        return this.normalizePattern(validPattern);
    }
    normalizePattern(pattern) {
        return (0, utils_1.transformPatternToRoute)(pattern);
    }
}
exports.Server = Server;
