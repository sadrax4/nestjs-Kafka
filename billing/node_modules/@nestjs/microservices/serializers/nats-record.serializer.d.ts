import { ReadPacket } from '../interfaces';
import { Serializer } from '../interfaces/serializer.interface';
import { NatsRecord } from '../record-builders';
export declare class NatsRecordSerializer implements Serializer<ReadPacket, NatsRecord> {
    private readonly jsonCodec;
    constructor();
    serialize(packet: ReadPacket | any): NatsRecord;
}
