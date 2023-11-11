import { PipeTransform, Type } from '@nestjs/common';
/**
 * Microservice message pattern payload parameter decorator.
 *
 * @publicApi
 */
export declare function Payload(): ParameterDecorator;
/**
 * Microservice message pattern payload parameter decorator.
 *
 * Example:
 * ```typescript
 * create(@Payload(new ValidationPipe()) createDto: CreateCatDto)
 * ```
 * @param pipes one or more pipes - either instances or classes - to apply to
 * the bound parameter.
 *
 * @publicApi
 */
export declare function Payload(...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator;
/**
 * Microservice message pattern payload parameter decorator. Extracts a property from the
 * payload object. May also apply pipes to the bound parameter.
 *
 * For example, extracting all params:
 * ```typescript
 * findMany(@Payload() ids: string[])
 * ```
 *
 * For example, extracting a single param:
 * ```typescript
 * create(@Payload('data') createDto: { data: string })
 * ```
 *
 * For example, extracting a single param with pipe:
 * ```typescript
 * create(@Payload('data', new ValidationPipe()) createDto: { data: string })
 * ```
 * @param propertyKey name of single property to extract from the message payload
 * @param pipes one or more pipes - either instances or classes - to apply to
 * the bound parameter.
 *
 * @publicApi
 */
export declare function Payload(propertyKey?: string, ...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator;
