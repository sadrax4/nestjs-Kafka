import { Controller } from '@nestjs/common/interfaces/controllers/controller.interface';
import { ApplicationConfig } from '@nestjs/core/application-config';
import { BaseExceptionFilterContext } from '@nestjs/core/exceptions/base-exception-filter-context';
import { NestContainer } from '@nestjs/core/injector/container';
import { Observable } from 'rxjs';
import { RpcExceptionsHandler } from '../exceptions/rpc-exceptions-handler';
/**
 * @publicApi
 */
export declare class ExceptionFiltersContext extends BaseExceptionFilterContext {
    private readonly config;
    constructor(container: NestContainer, config: ApplicationConfig);
    create(instance: Controller, callback: <T = any>(data: T) => Observable<any>, module: string, contextId?: import("@nestjs/core/injector/instance-wrapper").ContextId, inquirerId?: string): RpcExceptionsHandler;
    getGlobalMetadata<T extends any[]>(contextId?: import("@nestjs/core/injector/instance-wrapper").ContextId, inquirerId?: string): T;
}
