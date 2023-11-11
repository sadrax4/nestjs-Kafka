/// <reference types="node" />
/// <reference types="node" />
import { Server as NetSocket, Socket } from 'net';
import { Transport } from '../enums';
import { TcpSocket } from '../helpers';
import { CustomTransportStrategy } from '../interfaces';
import { TcpOptions } from '../interfaces/microservice-configuration.interface';
import { Server } from './server';
export declare class ServerTCP extends Server implements CustomTransportStrategy {
    private readonly options;
    readonly transportId = Transport.TCP;
    protected server: NetSocket;
    private readonly port;
    private readonly host;
    private readonly socketClass;
    private isExplicitlyTerminated;
    private retryAttemptsCount;
    private tlsOptions?;
    constructor(options: TcpOptions['options']);
    listen(callback: (err?: unknown, ...optionalParams: unknown[]) => void): void;
    close(): void;
    bindHandler(socket: Socket): void;
    handleMessage(socket: TcpSocket, rawMessage: unknown): Promise<any>;
    handleClose(): undefined | number | NodeJS.Timer;
    private init;
    private getSocketInstance;
}
