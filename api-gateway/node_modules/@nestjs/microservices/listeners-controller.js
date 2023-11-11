"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenersController = void 0;
const shared_utils_1 = require("@nestjs/common/utils/shared.utils");
const context_id_factory_1 = require("@nestjs/core/helpers/context-id-factory");
const execution_context_host_1 = require("@nestjs/core/helpers/execution-context-host");
const constants_1 = require("@nestjs/core/injector/constants");
const metadata_scanner_1 = require("@nestjs/core/metadata-scanner");
const request_constants_1 = require("@nestjs/core/router/request/request-constants");
const rxjs_1 = require("rxjs");
const request_context_host_1 = require("./context/request-context-host");
const rpc_metadata_constants_1 = require("./context/rpc-metadata-constants");
const enums_1 = require("./enums");
const listener_metadata_explorer_1 = require("./listener-metadata-explorer");
const server_1 = require("./server");
class ListenersController {
    constructor(clientsContainer, contextCreator, container, injector, clientFactory, exceptionFiltersContext, graphInspector) {
        this.clientsContainer = clientsContainer;
        this.contextCreator = contextCreator;
        this.container = container;
        this.injector = injector;
        this.clientFactory = clientFactory;
        this.exceptionFiltersContext = exceptionFiltersContext;
        this.graphInspector = graphInspector;
        this.metadataExplorer = new listener_metadata_explorer_1.ListenerMetadataExplorer(new metadata_scanner_1.MetadataScanner());
        this.exceptionFiltersCache = new WeakMap();
    }
    registerPatternHandlers(instanceWrapper, server, moduleKey) {
        const { instance } = instanceWrapper;
        const isStatic = instanceWrapper.isDependencyTreeStatic();
        const patternHandlers = this.metadataExplorer.explore(instance);
        const moduleRef = this.container.getModuleByKey(moduleKey);
        const defaultCallMetadata = server instanceof server_1.ServerGrpc
            ? rpc_metadata_constants_1.DEFAULT_GRPC_CALLBACK_METADATA
            : rpc_metadata_constants_1.DEFAULT_CALLBACK_METADATA;
        patternHandlers
            .filter(({ transport }) => (0, shared_utils_1.isUndefined)(transport) ||
            (0, shared_utils_1.isUndefined)(server.transportId) ||
            transport === server.transportId)
            .reduce((acc, handler) => {
            handler.patterns.forEach(pattern => acc.push({ ...handler, patterns: [pattern] }));
            return acc;
        }, [])
            .forEach((definition) => {
            const { patterns: [pattern], targetCallback, methodKey, extras, isEventHandler, } = definition;
            this.insertEntrypointDefinition(instanceWrapper, definition, server.transportId);
            if (isStatic) {
                const proxy = this.contextCreator.create(instance, targetCallback, moduleKey, methodKey, constants_1.STATIC_CONTEXT, undefined, defaultCallMetadata);
                if (isEventHandler) {
                    const eventHandler = async (...args) => {
                        const originalArgs = args;
                        const [dataOrContextHost] = originalArgs;
                        if (dataOrContextHost instanceof request_context_host_1.RequestContextHost) {
                            args = args.slice(1, args.length);
                        }
                        const returnValue = proxy(...args);
                        return this.forkJoinHandlersIfAttached(returnValue, originalArgs, eventHandler);
                    };
                    return server.addHandler(pattern, eventHandler, isEventHandler, extras);
                }
                else {
                    return server.addHandler(pattern, proxy, isEventHandler, extras);
                }
            }
            const asyncHandler = this.createRequestScopedHandler(instanceWrapper, pattern, moduleRef, moduleKey, methodKey, defaultCallMetadata, isEventHandler);
            server.addHandler(pattern, asyncHandler, isEventHandler, extras);
        });
    }
    insertEntrypointDefinition(instanceWrapper, definition, transportId) {
        this.graphInspector.insertEntrypointDefinition({
            type: 'microservice',
            methodName: definition.methodKey,
            className: instanceWrapper.metatype?.name,
            classNodeId: instanceWrapper.id,
            metadata: {
                key: definition.patterns.toString(),
                transportId: typeof transportId === 'number'
                    ? enums_1.Transport[transportId]
                    : transportId,
                patterns: definition.patterns,
                isEventHandler: definition.isEventHandler,
                extras: definition.extras,
            },
        }, instanceWrapper.id);
    }
    forkJoinHandlersIfAttached(currentReturnValue, originalArgs, handlerRef) {
        if (handlerRef.next) {
            const returnedValueWrapper = handlerRef.next(...originalArgs);
            return (0, rxjs_1.forkJoin)({
                current: this.transformToObservable(currentReturnValue),
                next: this.transformToObservable(returnedValueWrapper),
            });
        }
        return currentReturnValue;
    }
    assignClientsToProperties(instance) {
        for (const { property, metadata, } of this.metadataExplorer.scanForClientHooks(instance)) {
            const client = this.clientFactory.create(metadata);
            this.clientsContainer.addClient(client);
            this.assignClientToInstance(instance, property, client);
        }
    }
    assignClientToInstance(instance, property, client) {
        Reflect.set(instance, property, client);
    }
    createRequestScopedHandler(wrapper, pattern, moduleRef, moduleKey, methodKey, defaultCallMetadata = rpc_metadata_constants_1.DEFAULT_CALLBACK_METADATA, isEventHandler = false) {
        const collection = moduleRef.controllers;
        const { instance } = wrapper;
        const isTreeDurable = wrapper.isDependencyTreeDurable();
        const requestScopedHandler = async (...args) => {
            try {
                let contextId;
                let [dataOrContextHost] = args;
                if (dataOrContextHost instanceof request_context_host_1.RequestContextHost) {
                    contextId = this.getContextId(dataOrContextHost, isTreeDurable);
                    args.shift();
                }
                else {
                    const [data, reqCtx] = args;
                    const request = request_context_host_1.RequestContextHost.create(pattern, data, reqCtx);
                    contextId = this.getContextId(request, isTreeDurable);
                    dataOrContextHost = request;
                }
                const contextInstance = await this.injector.loadPerContext(instance, moduleRef, collection, contextId);
                const proxy = this.contextCreator.create(contextInstance, contextInstance[methodKey], moduleKey, methodKey, contextId, wrapper.id, defaultCallMetadata);
                const returnValue = proxy(...args);
                if (isEventHandler) {
                    return this.forkJoinHandlersIfAttached(returnValue, [dataOrContextHost, ...args], requestScopedHandler);
                }
                return returnValue;
            }
            catch (err) {
                let exceptionFilter = this.exceptionFiltersCache.get(instance[methodKey]);
                if (!exceptionFilter) {
                    exceptionFilter = this.exceptionFiltersContext.create(instance, instance[methodKey], moduleKey);
                    this.exceptionFiltersCache.set(instance[methodKey], exceptionFilter);
                }
                const host = new execution_context_host_1.ExecutionContextHost(args);
                host.setType('rpc');
                return exceptionFilter.handle(err, host);
            }
        };
        return requestScopedHandler;
    }
    getContextId(request, isTreeDurable) {
        const contextId = context_id_factory_1.ContextIdFactory.getByRequest(request);
        if (!request[request_constants_1.REQUEST_CONTEXT_ID]) {
            Object.defineProperty(request, request_constants_1.REQUEST_CONTEXT_ID, {
                value: contextId,
                enumerable: false,
                writable: false,
                configurable: false,
            });
            const requestProviderValue = isTreeDurable ? contextId.payload : request;
            this.container.registerRequestProvider(requestProviderValue, contextId);
        }
        return contextId;
    }
    transformToObservable(resultOrDeferred) {
        if (resultOrDeferred instanceof Promise) {
            return (0, rxjs_1.from)(resultOrDeferred).pipe((0, rxjs_1.mergeMap)(val => ((0, rxjs_1.isObservable)(val) ? val : (0, rxjs_1.of)(val))));
        }
        if ((0, rxjs_1.isObservable)(resultOrDeferred)) {
            return resultOrDeferred;
        }
        return (0, rxjs_1.of)(resultOrDeferred);
    }
}
exports.ListenersController = ListenersController;
