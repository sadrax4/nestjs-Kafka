import { DynamicModule } from '@nestjs/common';
import { ClientsModuleAsyncOptions, ClientsModuleOptions } from './interfaces';
export declare class ClientsModule {
    static register(options: ClientsModuleOptions): DynamicModule;
    static registerAsync(options: ClientsModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
    private static createFactoryWrapper;
    private static assignOnAppShutdownHook;
}
