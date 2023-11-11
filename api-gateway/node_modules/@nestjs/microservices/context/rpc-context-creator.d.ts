import { ContextType, Controller, PipeTransform } from '@nestjs/common/interfaces';
import { GuardsConsumer } from '@nestjs/core/guards/guards-consumer';
import { GuardsContextCreator } from '@nestjs/core/guards/guards-context-creator';
import { ParamProperties } from '@nestjs/core/helpers/context-utils';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { ParamsMetadata } from '@nestjs/core/helpers/interfaces';
import { InterceptorsConsumer } from '@nestjs/core/interceptors/interceptors-consumer';
import { InterceptorsContextCreator } from '@nestjs/core/interceptors/interceptors-context-creator';
import { PipesConsumer } from '@nestjs/core/pipes/pipes-consumer';
import { PipesContextCreator } from '@nestjs/core/pipes/pipes-context-creator';
import { Observable } from 'rxjs';
import { RpcParamsFactory } from '../factories/rpc-params-factory';
import { ExceptionFiltersContext } from './exception-filters-context';
import { RpcProxy } from './rpc-proxy';
type RpcParamProperties = ParamProperties & {
    metatype?: any;
};
export interface RpcHandlerMetadata {
    argsLength: number;
    paramtypes: any[];
    getParamsMetadata: (moduleKey: string) => RpcParamProperties[];
}
export declare class RpcContextCreator {
    private readonly rpcProxy;
    private readonly exceptionFiltersContext;
    private readonly pipesContextCreator;
    private readonly pipesConsumer;
    private readonly guardsContextCreator;
    private readonly guardsConsumer;
    private readonly interceptorsContextCreator;
    private readonly interceptorsConsumer;
    private readonly contextUtils;
    private readonly rpcParamsFactory;
    private readonly handlerMetadataStorage;
    constructor(rpcProxy: RpcProxy, exceptionFiltersContext: ExceptionFiltersContext, pipesContextCreator: PipesContextCreator, pipesConsumer: PipesConsumer, guardsContextCreator: GuardsContextCreator, guardsConsumer: GuardsConsumer, interceptorsContextCreator: InterceptorsContextCreator, interceptorsConsumer: InterceptorsConsumer);
    create<T extends ParamsMetadata = ParamsMetadata>(instance: Controller, callback: (...args: unknown[]) => Observable<any>, moduleKey: string, methodName: string, contextId?: import("@nestjs/core").ContextId, inquirerId?: string, defaultCallMetadata?: Record<string, any>): (...args: any[]) => Promise<Observable<any>>;
    reflectCallbackParamtypes(instance: Controller, callback: (...args: unknown[]) => unknown): unknown[];
    createGuardsFn<TContext extends string = ContextType>(guards: any[], instance: Controller, callback: (...args: unknown[]) => unknown, contextType?: TContext): Function | null;
    getMetadata<TMetadata, TContext extends ContextType = ContextType>(instance: Controller, methodName: string, defaultCallMetadata: Record<string, any>, contextType: TContext): RpcHandlerMetadata;
    exchangeKeysForValues<TMetadata = any>(keys: string[], metadata: TMetadata, moduleContext: string, paramsFactory: RpcParamsFactory, contextFactory: (args: unknown[]) => ExecutionContextHost): ParamProperties[];
    createPipesFn(pipes: PipeTransform[], paramsOptions: (ParamProperties & {
        metatype?: unknown;
    })[]): (args: unknown[], ...params: unknown[]) => Promise<void>;
    getParamValue<T>(value: T, { metatype, type, data }: {
        metatype: any;
        type: any;
        data: any;
    }, pipes: PipeTransform[]): Promise<any>;
}
export {};
