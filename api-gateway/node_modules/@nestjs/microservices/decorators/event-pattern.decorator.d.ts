import { Transport } from '../enums';
/**
 * Subscribes to incoming events which fulfils chosen pattern.
 *
 * @publicApi
 */
export declare const EventPattern: {
    <T = string>(metadata?: T): MethodDecorator;
    <T = string>(metadata?: T, transport?: Transport | symbol): MethodDecorator;
    <T = string>(metadata?: T, extras?: Record<string, any>): MethodDecorator;
    <T = string>(metadata?: T, transport?: Transport | symbol, extras?: Record<string, any>): MethodDecorator;
};
