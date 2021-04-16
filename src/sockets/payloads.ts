export type WsIncomingPayload = {
    id: string;
    type: IncomingMsgType;
    data: unknown;
};

export type WsOutgoingPayload = {
    id: string;
    type: OutgoingMsgType;
    data: unknown;
};

export enum IncomingMsgType {
    Connection = 'connection'
}

export enum OutgoingMsgType {
    ConnectionStatus = 'connection-status',
    Heartbeat = 'heartbeat'
}

export type ConnectionRequestPayload = {
    responderId: string;
};