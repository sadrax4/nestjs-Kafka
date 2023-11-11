"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientGrpcProxy = void 0;
const logger_service_1 = require("@nestjs/common/services/logger.service");
const load_package_util_1 = require("@nestjs/common/utils/load-package.util");
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const rxjs_1 = require("rxjs");
const constants_1 = require("../constants");
const invalid_grpc_package_exception_1 = require("../errors/invalid-grpc-package.exception");
const invalid_grpc_service_exception_1 = require("../errors/invalid-grpc-service.exception");
const invalid_proto_definition_exception_1 = require("../errors/invalid-proto-definition.exception");
const client_proxy_1 = require("./client-proxy");
const constants_2 = require("./constants");
let grpcPackage = {};
let grpcProtoLoaderPackage = {};
/**
 * @publicApi
 */
class ClientGrpcProxy extends client_proxy_1.ClientProxy {
    constructor(options) {
        super();
        this.options = options;
        this.logger = new logger_service_1.Logger(client_proxy_1.ClientProxy.name);
        this.clients = new Map();
        this.grpcClients = [];
        this.url = this.getOptionsProp(options, 'url') || constants_1.GRPC_DEFAULT_URL;
        const protoLoader = this.getOptionsProp(options, 'protoLoader') || constants_1.GRPC_DEFAULT_PROTO_LOADER;
        grpcPackage = (0, load_package_util_1.loadPackage)('@grpc/grpc-js', ClientGrpcProxy.name, () => require('@grpc/grpc-js'));
        grpcProtoLoaderPackage = (0, load_package_util_1.loadPackage)(protoLoader, ClientGrpcProxy.name, () => protoLoader === constants_1.GRPC_DEFAULT_PROTO_LOADER
            ? require('@grpc/proto-loader')
            : require(protoLoader));
        this.grpcClients = this.createClients();
    }
    getService(name) {
        const grpcClient = this.createClientByServiceName(name);
        const clientRef = this.getClient(name);
        if (!clientRef) {
            throw new invalid_grpc_service_exception_1.InvalidGrpcServiceException(name);
        }
        const protoMethods = Object.keys(clientRef[name].prototype);
        const grpcService = {};
        protoMethods.forEach(m => {
            grpcService[m] = this.createServiceMethod(grpcClient, m);
        });
        return grpcService;
    }
    getClientByServiceName(name) {
        return this.clients.get(name) || this.createClientByServiceName(name);
    }
    createClientByServiceName(name) {
        const clientRef = this.getClient(name);
        if (!clientRef) {
            throw new invalid_grpc_service_exception_1.InvalidGrpcServiceException(name);
        }
        const channelOptions = this.options && this.options.channelOptions
            ? this.options.channelOptions
            : {};
        if (this.options && this.options.maxSendMessageLength) {
            channelOptions['grpc.max_send_message_length'] =
                this.options.maxSendMessageLength;
        }
        if (this.options && this.options.maxReceiveMessageLength) {
            channelOptions['grpc.max_receive_message_length'] =
                this.options.maxReceiveMessageLength;
        }
        if (this.options && this.options.maxMetadataSize) {
            channelOptions['grpc.max_metadata_size'] = this.options.maxMetadataSize;
        }
        const keepaliveOptions = this.getKeepaliveOptions();
        const options = {
            ...channelOptions,
            ...keepaliveOptions,
        };
        const credentials = this.options.credentials || grpcPackage.credentials.createInsecure();
        const grpcClient = new clientRef[name](this.url, credentials, options);
        this.clients.set(name, grpcClient);
        return grpcClient;
    }
    getKeepaliveOptions() {
        if (!(0, shared_utils_1.isObject)(this.options.keepalive)) {
            return {};
        }
        const keepaliveKeys = {
            keepaliveTimeMs: 'grpc.keepalive_time_ms',
            keepaliveTimeoutMs: 'grpc.keepalive_timeout_ms',
            keepalivePermitWithoutCalls: 'grpc.keepalive_permit_without_calls',
            http2MaxPingsWithoutData: 'grpc.http2.max_pings_without_data',
            http2MinTimeBetweenPingsMs: 'grpc.http2.min_time_between_pings_ms',
            http2MinPingIntervalWithoutDataMs: 'grpc.http2.min_ping_interval_without_data_ms',
            http2MaxPingStrikes: 'grpc.http2.max_ping_strikes',
        };
        const keepaliveOptions = {};
        for (const [optionKey, optionValue] of Object.entries(this.options.keepalive)) {
            const key = keepaliveKeys[optionKey];
            if (key === undefined) {
                continue;
            }
            keepaliveOptions[key] = optionValue;
        }
        return keepaliveOptions;
    }
    createServiceMethod(client, methodName) {
        return client[methodName].responseStream
            ? this.createStreamServiceMethod(client, methodName)
            : this.createUnaryServiceMethod(client, methodName);
    }
    createStreamServiceMethod(client, methodName) {
        return (...args) => {
            const isRequestStream = client[methodName].requestStream;
            const stream = new rxjs_1.Observable(observer => {
                let isClientCanceled = false;
                let upstreamSubscription;
                const upstreamSubjectOrData = args[0];
                const maybeMetadata = args[1];
                const isUpstreamSubject = upstreamSubjectOrData && (0, shared_utils_1.isFunction)(upstreamSubjectOrData.subscribe);
                const call = isRequestStream && isUpstreamSubject
                    ? client[methodName](maybeMetadata)
                    : client[methodName](...args);
                if (isRequestStream && isUpstreamSubject) {
                    upstreamSubscription = upstreamSubjectOrData.subscribe((val) => call.write(val), (err) => call.emit('error', err), () => call.end());
                }
                call.on('data', (data) => observer.next(data));
                call.on('error', (error) => {
                    if (error.details === constants_2.GRPC_CANCELLED) {
                        call.destroy();
                        if (isClientCanceled) {
                            return;
                        }
                    }
                    observer.error(this.serializeError(error));
                });
                call.on('end', () => {
                    if (upstreamSubscription) {
                        upstreamSubscription.unsubscribe();
                        upstreamSubscription = null;
                    }
                    call.removeAllListeners();
                    observer.complete();
                });
                return () => {
                    if (upstreamSubscription) {
                        upstreamSubscription.unsubscribe();
                        upstreamSubscription = null;
                    }
                    if (call.finished) {
                        return undefined;
                    }
                    isClientCanceled = true;
                    call.cancel();
                };
            });
            return stream;
        };
    }
    createUnaryServiceMethod(client, methodName) {
        return (...args) => {
            const isRequestStream = client[methodName].requestStream;
            const upstreamSubjectOrData = args[0];
            const isUpstreamSubject = upstreamSubjectOrData && (0, shared_utils_1.isFunction)(upstreamSubjectOrData.subscribe);
            if (isRequestStream && isUpstreamSubject) {
                return new rxjs_1.Observable(observer => {
                    let isClientCanceled = false;
                    const callArgs = [
                        (error, data) => {
                            if (error) {
                                if (error.details === constants_2.GRPC_CANCELLED || error.code === 1) {
                                    call.destroy();
                                    if (isClientCanceled) {
                                        return;
                                    }
                                }
                                return observer.error(this.serializeError(error));
                            }
                            observer.next(data);
                            observer.complete();
                        },
                    ];
                    const maybeMetadata = args[1];
                    if (maybeMetadata) {
                        callArgs.unshift(maybeMetadata);
                    }
                    const call = client[methodName](...callArgs);
                    const upstreamSubscription = upstreamSubjectOrData.subscribe((val) => call.write(val), (err) => call.emit('error', err), () => call.end());
                    return () => {
                        upstreamSubscription.unsubscribe();
                        if (!call.finished) {
                            isClientCanceled = true;
                            call.cancel();
                        }
                    };
                });
            }
            return new rxjs_1.Observable(observer => {
                const call = client[methodName](...args, (error, data) => {
                    if (error) {
                        return observer.error(this.serializeError(error));
                    }
                    observer.next(data);
                    observer.complete();
                });
                return () => {
                    if (!call.finished) {
                        call.cancel();
                    }
                };
            });
        };
    }
    createClients() {
        const grpcContext = this.loadProto();
        const packageOption = this.getOptionsProp(this.options, 'package');
        const grpcPackages = [];
        const packageNames = Array.isArray(packageOption)
            ? packageOption
            : [packageOption];
        for (const packageName of packageNames) {
            const grpcPkg = this.lookupPackage(grpcContext, packageName);
            if (!grpcPkg) {
                const invalidPackageError = new invalid_grpc_package_exception_1.InvalidGrpcPackageException(packageName);
                this.logger.error(invalidPackageError.message, invalidPackageError.stack);
                throw invalidPackageError;
            }
            grpcPackages.push(grpcPkg);
        }
        return grpcPackages;
    }
    loadProto() {
        try {
            const file = this.getOptionsProp(this.options, 'protoPath');
            const loader = this.getOptionsProp(this.options, 'loader');
            const packageDefinition = this.getOptionsProp(this.options, 'packageDefinition') ||
                grpcProtoLoaderPackage.loadSync(file, loader);
            const packageObject = grpcPackage.loadPackageDefinition(packageDefinition);
            return packageObject;
        }
        catch (err) {
            const invalidProtoError = new invalid_proto_definition_exception_1.InvalidProtoDefinitionException(err.path);
            const message = err && err.message ? err.message : invalidProtoError.message;
            this.logger.error(message, invalidProtoError.stack);
            throw invalidProtoError;
        }
    }
    lookupPackage(root, packageName) {
        /** Reference: https://github.com/kondi/rxjs-grpc */
        let pkg = root;
        if (packageName) {
            for (const name of packageName.split('.')) {
                pkg = pkg[name];
            }
        }
        return pkg;
    }
    close() {
        this.grpcClients
            .filter(client => client && (0, shared_utils_1.isFunction)(client.close))
            .forEach(client => client.close());
        this.grpcClients = [];
    }
    async connect() {
        throw new Error('The "connect()" method is not supported in gRPC mode.');
    }
    send(pattern, data) {
        throw new Error('Method is not supported in gRPC mode. Use ClientGrpc instead (learn more in the documentation).');
    }
    getClient(name) {
        return this.grpcClients.find(client => client.hasOwnProperty(name));
    }
    publish(packet, callback) {
        throw new Error('Method is not supported in gRPC mode. Use ClientGrpc instead (learn more in the documentation).');
    }
    async dispatchEvent(packet) {
        throw new Error('Method is not supported in gRPC mode. Use ClientGrpc instead (learn more in the documentation).');
    }
}
exports.ClientGrpcProxy = ClientGrpcProxy;
