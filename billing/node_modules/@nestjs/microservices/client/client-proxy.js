"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientProxy = void 0;
const random_string_generator_util_1 = require("@nestjs/common/utils/random-string-generator.util");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const constants_1 = require("../constants");
const incoming_response_deserializer_1 = require("../deserializers/incoming-response.deserializer");
const invalid_message_exception_1 = require("../errors/invalid-message.exception");
const identity_serializer_1 = require("../serializers/identity.serializer");
const utils_1 = require("../utils");
class ClientProxy {
    constructor() {
        this.routingMap = new Map();
    }
    send(pattern, data) {
        if ((0, shared_utils_1.isNil)(pattern) || (0, shared_utils_1.isNil)(data)) {
            return (0, rxjs_1.throwError)(() => new invalid_message_exception_1.InvalidMessageException());
        }
        return (0, rxjs_1.defer)(async () => this.connect()).pipe((0, operators_1.mergeMap)(() => new rxjs_1.Observable((observer) => {
            const callback = this.createObserver(observer);
            return this.publish({ pattern, data }, callback);
        })));
    }
    emit(pattern, data) {
        if ((0, shared_utils_1.isNil)(pattern) || (0, shared_utils_1.isNil)(data)) {
            return (0, rxjs_1.throwError)(() => new invalid_message_exception_1.InvalidMessageException());
        }
        const source = (0, rxjs_1.defer)(async () => this.connect()).pipe((0, operators_1.mergeMap)(() => this.dispatchEvent({ pattern, data })));
        const connectableSource = (0, rxjs_1.connectable)(source, {
            connector: () => new rxjs_1.Subject(),
            resetOnDisconnect: false,
        });
        connectableSource.connect();
        return connectableSource;
    }
    createObserver(observer) {
        return ({ err, response, isDisposed }) => {
            if (err) {
                return observer.error(this.serializeError(err));
            }
            else if (response !== undefined && isDisposed) {
                observer.next(this.serializeResponse(response));
                return observer.complete();
            }
            else if (isDisposed) {
                return observer.complete();
            }
            observer.next(this.serializeResponse(response));
        };
    }
    serializeError(err) {
        return err;
    }
    serializeResponse(response) {
        return response;
    }
    assignPacketId(packet) {
        const id = (0, random_string_generator_util_1.randomStringGenerator)();
        return Object.assign(packet, { id });
    }
    connect$(instance, errorEvent = constants_1.ERROR_EVENT, connectEvent = constants_1.CONNECT_EVENT) {
        const error$ = (0, rxjs_1.fromEvent)(instance, errorEvent).pipe((0, operators_1.map)((err) => {
            throw err;
        }));
        const connect$ = (0, rxjs_1.fromEvent)(instance, connectEvent);
        return (0, rxjs_1.merge)(error$, connect$).pipe((0, operators_1.take)(1));
    }
    getOptionsProp(obj, prop, defaultValue = undefined) {
        return obj && prop in obj ? obj[prop] : defaultValue;
    }
    normalizePattern(pattern) {
        return (0, utils_1.transformPatternToRoute)(pattern);
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
                new incoming_response_deserializer_1.IncomingResponseDeserializer();
    }
}
exports.ClientProxy = ClientProxy;
