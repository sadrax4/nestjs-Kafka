/// <reference types="node" />
import { ConnectionOptions } from 'tls';
import { TcpSocket } from '../helpers';
import { ReadPacket, WritePacket } from '../interfaces';
import { TcpClientOptions } from '../interfaces/client-metadata.interface';
import { ClientProxy } from './client-proxy';
/**
 * @publicApi
 */
export declare class ClientTCP extends ClientProxy {
    protected connection: Promise<any>;
    private readonly logger;
    private readonly port;
    private readonly host;
    private readonly socketClass;
    private isConnected;
    private socket;
    tlsOptions?: ConnectionOptions;
    constructor(options: TcpClientOptions['options']);
    connect(): Promise<any>;
    handleResponse(buffer: unknown): Promise<void>;
    createSocket(): TcpSocket;
    close(): void;
    bindEvents(socket: TcpSocket): void;
    handleError(err: any): void;
    handleClose(): void;
    protected publish(partialPacket: ReadPacket, callback: (packet: WritePacket) => any): () => void;
    protected dispatchEvent(packet: ReadPacket): Promise<any>;
}
