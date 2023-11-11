import { Observable, Observer } from 'rxjs';
import { ClientOptions, MsPattern, PacketId, ReadPacket, WritePacket } from '../interfaces';
import { ProducerDeserializer } from '../interfaces/deserializer.interface';
import { ProducerSerializer } from '../interfaces/serializer.interface';
export declare abstract class ClientProxy {
    abstract connect(): Promise<any>;
    abstract close(): any;
    protected routingMap: Map<string, Function>;
    protected serializer: ProducerSerializer;
    protected deserializer: ProducerDeserializer;
    send<TResult = any, TInput = any>(pattern: any, data: TInput): Observable<TResult>;
    emit<TResult = any, TInput = any>(pattern: any, data: TInput): Observable<TResult>;
    protected abstract publish(packet: ReadPacket, callback: (packet: WritePacket) => void): () => void;
    protected abstract dispatchEvent<T = any>(packet: ReadPacket): Promise<T>;
    protected createObserver<T>(observer: Observer<T>): (packet: WritePacket) => void;
    protected serializeError(err: any): any;
    protected serializeResponse(response: any): any;
    protected assignPacketId(packet: ReadPacket): ReadPacket & PacketId;
    protected connect$(instance: any, errorEvent?: string, connectEvent?: string): Observable<any>;
    protected getOptionsProp<T extends ClientOptions['options'], K extends keyof T>(obj: T, prop: K, defaultValue?: T[K]): T[K];
    protected normalizePattern(pattern: MsPattern): string;
    protected initializeSerializer(options: ClientOptions['options']): void;
    protected initializeDeserializer(options: ClientOptions['options']): void;
}
