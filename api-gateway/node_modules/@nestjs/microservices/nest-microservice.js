"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestMicroservice = void 0;
const logger_service_1 = require("@nestjs/common/services/logger.service");
const constants_1 = require("@nestjs/core/constants");
const optional_require_1 = require("@nestjs/core/helpers/optional-require");
const injector_1 = require("@nestjs/core/injector/injector");
const nest_application_context_1 = require("@nestjs/core/nest-application-context");
const transport_enum_1 = require("./enums/transport.enum");
const microservices_module_1 = require("./microservices-module");
const server_factory_1 = require("./server/server-factory");
const { SocketModule } = (0, optional_require_1.optionalRequire)('@nestjs/websockets/socket-module', () => require('@nestjs/websockets/socket-module'));
class NestMicroservice extends nest_application_context_1.NestApplicationContext {
    constructor(container, config = {}, graphInspector, applicationConfig) {
        super(container, config);
        this.graphInspector = graphInspector;
        this.applicationConfig = applicationConfig;
        this.logger = new logger_service_1.Logger(NestMicroservice.name, {
            timestamp: true,
        });
        this.microservicesModule = new microservices_module_1.MicroservicesModule();
        this.socketModule = SocketModule ? new SocketModule() : null;
        this.isTerminated = false;
        this.isInitHookCalled = false;
        this.injector = new injector_1.Injector({ preview: config.preview });
        this.microservicesModule.register(container, this.graphInspector, this.applicationConfig, this.appOptions);
        this.createServer(config);
        this.selectContextModule();
    }
    createServer(config) {
        try {
            this.microserviceConfig = {
                transport: transport_enum_1.Transport.TCP,
                ...config,
            };
            const { strategy } = config;
            this.server = strategy
                ? strategy
                : server_factory_1.ServerFactory.create(this.microserviceConfig);
        }
        catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    async registerModules() {
        this.socketModule &&
            this.socketModule.register(this.container, this.applicationConfig, this.graphInspector, this.appOptions);
        if (!this.appOptions.preview) {
            this.microservicesModule.setupClients(this.container);
            this.registerListeners();
        }
        this.setIsInitialized(true);
        if (!this.isInitHookCalled) {
            await this.callInitHook();
            await this.callBootstrapHook();
        }
    }
    registerListeners() {
        this.microservicesModule.setupListeners(this.container, this.server);
    }
    useWebSocketAdapter(adapter) {
        this.applicationConfig.setIoAdapter(adapter);
        return this;
    }
    useGlobalFilters(...filters) {
        this.applicationConfig.useGlobalFilters(...filters);
        filters.forEach(item => this.graphInspector.insertOrphanedEnhancer({
            subtype: 'filter',
            ref: item,
        }));
        return this;
    }
    useGlobalPipes(...pipes) {
        this.applicationConfig.useGlobalPipes(...pipes);
        pipes.forEach(item => this.graphInspector.insertOrphanedEnhancer({
            subtype: 'pipe',
            ref: item,
        }));
        return this;
    }
    useGlobalInterceptors(...interceptors) {
        this.applicationConfig.useGlobalInterceptors(...interceptors);
        interceptors.forEach(item => this.graphInspector.insertOrphanedEnhancer({
            subtype: 'interceptor',
            ref: item,
        }));
        return this;
    }
    useGlobalGuards(...guards) {
        this.applicationConfig.useGlobalGuards(...guards);
        guards.forEach(item => this.graphInspector.insertOrphanedEnhancer({
            subtype: 'guard',
            ref: item,
        }));
        return this;
    }
    async init() {
        if (this.isInitialized) {
            return this;
        }
        await super.init();
        await this.registerModules();
        return this;
    }
    async listen() {
        this.assertNotInPreviewMode('listen');
        !this.isInitialized && (await this.registerModules());
        return new Promise((resolve, reject) => {
            this.server.listen((err, info) => {
                if (this.microserviceConfig?.autoFlushLogs ?? true) {
                    this.flushLogs();
                }
                if (err) {
                    return reject(err);
                }
                this.logger.log(constants_1.MESSAGES.MICROSERVICE_READY);
                resolve(info);
            });
        });
    }
    async close() {
        await this.server.close();
        if (this.isTerminated) {
            return;
        }
        this.setIsTerminated(true);
        await this.closeApplication();
    }
    setIsInitialized(isInitialized) {
        this.isInitialized = isInitialized;
    }
    setIsTerminated(isTerminated) {
        this.isTerminated = isTerminated;
    }
    setIsInitHookCalled(isInitHookCalled) {
        this.isInitHookCalled = isInitHookCalled;
    }
    async closeApplication() {
        this.socketModule && (await this.socketModule.close());
        this.microservicesModule && (await this.microservicesModule.close());
        await super.close();
        this.setIsTerminated(true);
    }
    async dispose() {
        if (this.isTerminated) {
            return;
        }
        await this.server.close();
        this.socketModule && (await this.socketModule.close());
        this.microservicesModule && (await this.microservicesModule.close());
    }
}
exports.NestMicroservice = NestMicroservice;
