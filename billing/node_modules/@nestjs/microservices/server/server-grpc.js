"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerGrpc = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const constants_1 = require("../constants");
const decorators_1 = require("../decorators");
const enums_1 = require("../enums");
const invalid_grpc_package_exception_1 = require("../errors/invalid-grpc-package.exception");
const invalid_proto_definition_exception_1 = require("../errors/invalid-proto-definition.exception");
const server_1 = require("./server");
let grpcPackage = {};
let grpcProtoLoaderPackage = {};
class ServerGrpc extends server_1.Server {
    constructor(options) {
        super();
        this.options = options;
        this.transportId = enums_1.Transport.GRPC;
        this.url = this.getOptionsProp(options, 'url') || constants_1.GRPC_DEFAULT_URL;
        const protoLoader = this.getOptionsProp(options, 'protoLoader') || constants_1.GRPC_DEFAULT_PROTO_LOADER;
        grpcPackage = this.loadPackage('@grpc/grpc-js', ServerGrpc.name, () => require('@grpc/grpc-js'));
        grpcProtoLoaderPackage = this.loadPackage(protoLoader, ServerGrpc.name, () => protoLoader === constants_1.GRPC_DEFAULT_PROTO_LOADER
            ? require('@grpc/proto-loader')
            : require(protoLoader));
    }
    async listen(callback) {
        try {
            this.grpcClient = await this.createClient();
            await this.start(callback);
        }
        catch (err) {
            callback(err);
        }
    }
    async start(callback) {
        await this.bindEvents();
        this.grpcClient.start();
        callback();
    }
    async bindEvents() {
        const grpcContext = this.loadProto();
        const packageOption = this.getOptionsProp(this.options, 'package');
        const packageNames = Array.isArray(packageOption)
            ? packageOption
            : [packageOption];
        for (const packageName of packageNames) {
            const grpcPkg = this.lookupPackage(grpcContext, packageName);
            await this.createServices(grpcPkg, packageName);
        }
    }
    /**
     * Will return all of the services along with their fully namespaced
     * names as an array of objects.
     * This method initiates recursive scan of grpcPkg object
     */
    getServiceNames(grpcPkg) {
        // Define accumulator to collect all of the services available to load
        const services = [];
        // Initiate recursive services collector starting with empty name
        this.collectDeepServices('', grpcPkg, services);
        return services;
    }
    /**
     * Will create service mapping from gRPC generated Object to handlers
     * defined with @GrpcMethod or @GrpcStreamMethod annotations
     *
     * @param grpcService
     * @param name
     */
    async createService(grpcService, name) {
        const service = {};
        for (const methodName in grpcService.prototype) {
            let pattern = '';
            let methodHandler = null;
            let streamingType = decorators_1.GrpcMethodStreamingType.NO_STREAMING;
            const methodFunction = grpcService.prototype[methodName];
            const methodReqStreaming = methodFunction.requestStream;
            if (!(0, shared_utils_1.isUndefined)(methodReqStreaming) && methodReqStreaming) {
                // Try first pattern to be presented, RX streaming pattern would be
                // a preferable pattern to select among a few defined
                pattern = this.createPattern(name, methodName, decorators_1.GrpcMethodStreamingType.RX_STREAMING);
                methodHandler = this.messageHandlers.get(pattern);
                streamingType = decorators_1.GrpcMethodStreamingType.RX_STREAMING;
                // If first pattern didn't match to any of handlers then try
                // pass-through handler to be presented
                if (!methodHandler) {
                    pattern = this.createPattern(name, methodName, decorators_1.GrpcMethodStreamingType.PT_STREAMING);
                    methodHandler = this.messageHandlers.get(pattern);
                    streamingType = decorators_1.GrpcMethodStreamingType.PT_STREAMING;
                }
            }
            else {
                pattern = this.createPattern(name, methodName, decorators_1.GrpcMethodStreamingType.NO_STREAMING);
                // Select handler if any presented for No-Streaming pattern
                methodHandler = this.messageHandlers.get(pattern);
                streamingType = decorators_1.GrpcMethodStreamingType.NO_STREAMING;
            }
            if (!methodHandler) {
                continue;
            }
            service[methodName] = await this.createServiceMethod(methodHandler, grpcService.prototype[methodName], streamingType);
        }
        return service;
    }
    /**
     * Will create a string of a JSON serialized format
     *
     * @param service name of the service which should be a match to gRPC service definition name
     * @param methodName name of the method which is coming after rpc keyword
     * @param streaming GrpcMethodStreamingType parameter which should correspond to
     * stream keyword in gRPC service request part
     */
    createPattern(service, methodName, streaming) {
        return JSON.stringify({
            service,
            rpc: methodName,
            streaming,
        });
    }
    /**
     * Will return async function which will handle gRPC call
     * with Rx streams or as a direct call passthrough
     *
     * @param methodHandler
     * @param protoNativeHandler
     */
    createServiceMethod(methodHandler, protoNativeHandler, streamType) {
        // If proto handler has request stream as "true" then we expect it to have
        // streaming from the side of requester
        if (protoNativeHandler.requestStream) {
            // If any handlers were defined with GrpcStreamMethod annotation use RX
            if (streamType === decorators_1.GrpcMethodStreamingType.RX_STREAMING) {
                return this.createRequestStreamMethod(methodHandler, protoNativeHandler.responseStream);
            }
            // If any handlers were defined with GrpcStreamCall annotation
            else if (streamType === decorators_1.GrpcMethodStreamingType.PT_STREAMING) {
                return this.createStreamCallMethod(methodHandler, protoNativeHandler.responseStream);
            }
        }
        return protoNativeHandler.responseStream
            ? this.createStreamServiceMethod(methodHandler)
            : this.createUnaryServiceMethod(methodHandler);
    }
    createUnaryServiceMethod(methodHandler) {
        return async (call, callback) => {
            const handler = methodHandler(call.request, call.metadata, call);
            this.transformToObservable(await handler).subscribe({
                next: async (data) => callback(null, await data),
                error: (err) => callback(err),
            });
        };
    }
    createStreamServiceMethod(methodHandler) {
        return async (call, callback) => {
            const handler = methodHandler(call.request, call.metadata, call);
            const result$ = this.transformToObservable(await handler);
            try {
                await this.writeObservableToGrpc(result$, call);
            }
            catch (err) {
                call.emit('error', err);
                return;
            }
        };
    }
    /**
     * Writes an observable to a GRPC call.
     *
     * This function will ensure that backpressure is managed while writing values
     * that come from an observable to a GRPC call.
     *
     * @param source The observable we want to write out to the GRPC call.
     * @param call The GRPC call we want to write to.
     * @returns A promise that resolves when we're done writing to the call.
     */
    writeObservableToGrpc(source, call) {
        return new Promise((resolve, reject) => {
            // This buffer is used to house values that arrive
            // while the call is in the process of writing and draining.
            const buffer = [];
            let isComplete = false;
            let clearToWrite = true;
            const cleanups = [];
            const cleanup = () => {
                for (const cleanup of cleanups) {
                    cleanup();
                }
            };
            const write = (value) => {
                // If the stream `write` returns `false`, we have
                // to wait for a drain event before writing again.
                // This is done to handle backpressure.
                clearToWrite = call.write(value);
            };
            const done = () => {
                call.end();
                resolve();
                cleanup();
            };
            // Handling backpressure by waiting for drain event
            const drainHandler = () => {
                if (!clearToWrite) {
                    clearToWrite = true;
                    if (buffer.length > 0) {
                        // Write any queued values we have in our buffer.
                        write(buffer.shift());
                    }
                    else if (isComplete) {
                        // Otherwise, if we're complete, end the call.
                        done();
                    }
                }
            };
            call.on('drain', drainHandler);
            cleanups.push(() => {
                call.off('drain', drainHandler);
            });
            const subscription = new rxjs_1.Subscription();
            // Make sure that a cancel event unsubscribes from
            // the source observable.
            const cancelHandler = () => {
                subscription.unsubscribe();
                done();
            };
            call.on(constants_1.CANCEL_EVENT, cancelHandler);
            cleanups.push(() => {
                call.off(constants_1.CANCEL_EVENT, cancelHandler);
            });
            subscription.add(source.subscribe({
                next: (value) => {
                    if (clearToWrite) {
                        // If we're not currently writing, then
                        // we can write the value immediately.
                        write(value);
                    }
                    else {
                        // If a value arrives while we're writing
                        // then we queue it up to be processed FIFO.
                        buffer.push(value);
                    }
                },
                error: (err) => {
                    call.emit('error', err);
                    reject(err);
                    cleanup();
                },
                complete: () => {
                    isComplete = true;
                    if (buffer.length === 0) {
                        done();
                    }
                },
            }));
        });
    }
    createRequestStreamMethod(methodHandler, isResponseStream) {
        return async (call, callback) => {
            const req = new rxjs_1.Subject();
            call.on('data', (m) => req.next(m));
            call.on('error', (e) => {
                // Check if error means that stream ended on other end
                const isCancelledError = String(e).toLowerCase().indexOf('cancelled');
                if (isCancelledError) {
                    call.end();
                    return;
                }
                // If another error then just pass it along
                req.error(e);
            });
            call.on('end', () => req.complete());
            const handler = methodHandler(req.asObservable(), call.metadata, call);
            const res = this.transformToObservable(await handler);
            if (isResponseStream) {
                await this.writeObservableToGrpc(res, call);
            }
            else {
                const response = await (0, rxjs_1.lastValueFrom)(res.pipe((0, operators_1.takeUntil)((0, rxjs_1.fromEvent)(call, constants_1.CANCEL_EVENT)), (0, operators_1.catchError)(err => {
                    callback(err, null);
                    return rxjs_1.EMPTY;
                }), (0, rxjs_1.defaultIfEmpty)(undefined)));
                if (!(0, shared_utils_1.isUndefined)(response)) {
                    callback(null, response);
                }
            }
        };
    }
    createStreamCallMethod(methodHandler, isResponseStream) {
        return async (call, callback) => {
            if (isResponseStream) {
                methodHandler(call);
            }
            else {
                methodHandler(call, callback);
            }
        };
    }
    async close() {
        if (this.grpcClient) {
            const graceful = this.getOptionsProp(this.options, 'gracefulShutdown');
            if (graceful) {
                await new Promise((resolve, reject) => {
                    this.grpcClient.tryShutdown((error) => {
                        if (error)
                            reject(error);
                        else
                            resolve();
                    });
                });
            }
            else {
                this.grpcClient.forceShutdown();
            }
        }
        this.grpcClient = null;
    }
    deserialize(obj) {
        try {
            return JSON.parse(obj);
        }
        catch (e) {
            return obj;
        }
    }
    addHandler(pattern, callback, isEventHandler = false) {
        const route = (0, shared_utils_1.isString)(pattern) ? pattern : JSON.stringify(pattern);
        callback.isEventHandler = isEventHandler;
        this.messageHandlers.set(route, callback);
    }
    async createClient() {
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
        const server = new grpcPackage.Server(channelOptions);
        const credentials = this.getOptionsProp(this.options, 'credentials');
        await new Promise((resolve, reject) => {
            server.bindAsync(this.url, credentials || grpcPackage.ServerCredentials.createInsecure(), (error, port) => error ? reject(error) : resolve(port));
        });
        return server;
    }
    lookupPackage(root, packageName) {
        /** Reference: https://github.com/kondi/rxjs-grpc */
        let pkg = root;
        for (const name of packageName.split(/\./)) {
            pkg = pkg[name];
        }
        return pkg;
    }
    loadProto() {
        try {
            const file = this.getOptionsProp(this.options, 'protoPath');
            const loader = this.getOptionsProp(this.options, 'loader');
            const packageDefinition = grpcProtoLoaderPackage.loadSync(file, loader);
            const packageObject = grpcPackage.loadPackageDefinition(packageDefinition);
            return packageObject;
        }
        catch (err) {
            const invalidProtoError = new invalid_proto_definition_exception_1.InvalidProtoDefinitionException(err.path);
            const message = err && err.message ? err.message : invalidProtoError.message;
            this.logger.error(message, invalidProtoError.stack);
            throw err;
        }
    }
    /**
     * Recursively fetch all of the service methods available on loaded
     * protobuf descriptor object, and collect those as an objects with
     * dot-syntax full-path names.
     *
     * Example:
     *  for proto package Bundle.FirstService with service Events { rpc...
     *  will be resolved to object of (while loaded for Bundle package):
     *    {
     *      name: "FirstService.Events",
     *      service: {Object}
     *    }
     */
    collectDeepServices(name, grpcDefinition, accumulator) {
        if (!(0, shared_utils_1.isObject)(grpcDefinition)) {
            return;
        }
        const keysToTraverse = Object.keys(grpcDefinition);
        // Traverse definitions or namespace extensions
        for (const key of keysToTraverse) {
            const nameExtended = this.parseDeepServiceName(name, key);
            const deepDefinition = grpcDefinition[key];
            const isServiceDefined = deepDefinition && !(0, shared_utils_1.isUndefined)(deepDefinition.service);
            const isServiceBoolean = isServiceDefined
                ? deepDefinition.service !== false
                : false;
            if (isServiceDefined && isServiceBoolean) {
                accumulator.push({
                    name: nameExtended,
                    service: deepDefinition,
                });
            }
            // Continue recursion until objects end or service definition found
            else {
                this.collectDeepServices(nameExtended, deepDefinition, accumulator);
            }
        }
    }
    parseDeepServiceName(name, key) {
        // If depth is zero then just return key
        if (name.length === 0) {
            return key;
        }
        // Otherwise add next through dot syntax
        return name + '.' + key;
    }
    async createServices(grpcPkg, packageName) {
        if (!grpcPkg) {
            const invalidPackageError = new invalid_grpc_package_exception_1.InvalidGrpcPackageException(packageName);
            this.logger.error(invalidPackageError.message, invalidPackageError.stack);
            throw invalidPackageError;
        }
        // Take all of the services defined in grpcPkg and assign them to
        // method handlers defined in Controllers
        for (const definition of this.getServiceNames(grpcPkg)) {
            this.grpcClient.addService(
            // First parameter requires exact service definition from proto
            definition.service.service, 
            // Here full proto definition required along with namespaced pattern name
            await this.createService(definition.service, definition.name));
        }
    }
}
exports.ServerGrpc = ServerGrpc;
