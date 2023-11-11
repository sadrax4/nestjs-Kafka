import { PipeTransform, Type } from '@nestjs/common';
import 'reflect-metadata';
import { RpcParamtype } from '../enums/rpc-paramtype.enum';
export declare function createRpcParamDecorator(paramtype: RpcParamtype): (...pipes: (Type<PipeTransform> | PipeTransform)[]) => ParameterDecorator;
export declare const createPipesRpcParamDecorator: (paramtype: RpcParamtype) => (data?: any, ...pipes: (Type<PipeTransform> | PipeTransform)[]) => ParameterDecorator;
