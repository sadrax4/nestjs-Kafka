"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MicroservicesModule = void 0;
const runtime_exception_1 = require("@nestjs/core/errors/exceptions/runtime.exception");
const guards_1 = require("@nestjs/core/guards");
const injector_1 = require("@nestjs/core/injector/injector");
const interceptors_1 = require("@nestjs/core/interceptors");
const pipes_1 = require("@nestjs/core/pipes");
const client_1 = require("./client");
const container_1 = require("./container");
const exception_filters_context_1 = require("./context/exception-filters-context");
const rpc_context_creator_1 = require("./context/rpc-context-creator");
const rpc_proxy_1 = require("./context/rpc-proxy");
const listeners_controller_1 = require("./listeners-controller");
class MicroservicesModule {
    constructor() {
        this.clientsContainer = new container_1.ClientsContainer();
    }
    register(container, graphInspector, config, options) {
        this.appOptions = options;
        const exceptionFiltersContext = new exception_filters_context_1.ExceptionFiltersContext(container, config);
        const contextCreator = new rpc_context_creator_1.RpcContextCreator(new rpc_proxy_1.RpcProxy(), exceptionFiltersContext, new pipes_1.PipesContextCreator(container, config), new pipes_1.PipesConsumer(), new guards_1.GuardsContextCreator(container, config), new guards_1.GuardsConsumer(), new interceptors_1.InterceptorsContextCreator(container, config), new interceptors_1.InterceptorsConsumer());
        const injector = new injector_1.Injector();
        this.listenersController = new listeners_controller_1.ListenersController(this.clientsContainer, contextCreator, container, injector, client_1.ClientProxyFactory, exceptionFiltersContext, graphInspector);
    }
    setupListeners(container, server) {
        if (!this.listenersController) {
            throw new runtime_exception_1.RuntimeException();
        }
        const modules = container.getModules();
        modules.forEach(({ controllers }, moduleRef) => this.bindListeners(controllers, server, moduleRef));
    }
    setupClients(container) {
        if (!this.listenersController) {
            throw new runtime_exception_1.RuntimeException();
        }
        if (this.appOptions?.preview) {
            return;
        }
        const modules = container.getModules();
        modules.forEach(({ controllers, providers }) => {
            this.bindClients(controllers);
            this.bindClients(providers);
        });
    }
    bindListeners(controllers, server, moduleName) {
        controllers.forEach(wrapper => this.listenersController.registerPatternHandlers(wrapper, server, moduleName));
    }
    bindClients(items) {
        items.forEach(({ instance, isNotMetatype }) => {
            !isNotMetatype &&
                this.listenersController.assignClientsToProperties(instance);
        });
    }
    async close() {
        const clients = this.clientsContainer.getAllClients();
        await Promise.all(clients.map(client => client.close()));
        this.clientsContainer.clear();
    }
}
exports.MicroservicesModule = MicroservicesModule;
