"use strict";
var ClientsModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsModule = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@nestjs/common");
const client_1 = require("../client");
let ClientsModule = ClientsModule_1 = class ClientsModule {
    static register(options) {
        const clientsOptions = !Array.isArray(options) ? options.clients : options;
        const clients = (clientsOptions || []).map(item => ({
            provide: item.name,
            useValue: this.assignOnAppShutdownHook(client_1.ClientProxyFactory.create(item)),
        }));
        return {
            module: ClientsModule_1,
            global: !Array.isArray(options) && options.isGlobal,
            providers: clients,
            exports: clients,
        };
    }
    static registerAsync(options) {
        const clientsOptions = !Array.isArray(options) ? options.clients : options;
        const providers = clientsOptions.reduce((accProviders, item) => accProviders
            .concat(this.createAsyncProviders(item))
            .concat(item.extraProviders || []), []);
        const imports = clientsOptions.reduce((accImports, option) => option.imports && !accImports.includes(option.imports)
            ? accImports.concat(option.imports)
            : accImports, []);
        return {
            module: ClientsModule_1,
            global: !Array.isArray(options) && options.isGlobal,
            imports,
            providers: providers,
            exports: providers,
        };
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: options.name,
                useFactory: this.createFactoryWrapper(options.useFactory),
                inject: options.inject || [],
            };
        }
        return {
            provide: options.name,
            useFactory: this.createFactoryWrapper((optionsFactory) => optionsFactory.createClientOptions()),
            inject: [options.useExisting || options.useClass],
        };
    }
    static createFactoryWrapper(useFactory) {
        return async (...args) => {
            const clientOptions = await useFactory(...args);
            const clientProxyRef = client_1.ClientProxyFactory.create(clientOptions);
            return this.assignOnAppShutdownHook(clientProxyRef);
        };
    }
    static assignOnAppShutdownHook(client) {
        client.onApplicationShutdown =
            client.close;
        return client;
    }
};
exports.ClientsModule = ClientsModule;
exports.ClientsModule = ClientsModule = ClientsModule_1 = tslib_1.__decorate([
    (0, common_1.Module)({})
], ClientsModule);
