/// <reference types="node" />
import { KafkaParserConfig } from '../interfaces';
export declare class KafkaParser {
    protected readonly keepBinary: boolean;
    constructor(config?: KafkaParserConfig);
    parse<T = any>(data: any): T;
    decode(value: Buffer): object | string | null | Buffer;
}
