/// <reference types="node" />
import { Serializer } from '../interfaces/serializer.interface';
export interface KafkaRequest<T = any> {
    key: Buffer | string | null;
    value: T;
    headers: Record<string, any>;
}
/**
 * @publicApi
 */
export declare class KafkaRequestSerializer implements Serializer<any, KafkaRequest | Promise<KafkaRequest>> {
    serialize(value: any): any;
    encode(value: any): Buffer | string | null;
}
