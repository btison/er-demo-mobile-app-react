import { Responder } from "../services/responder-service/responder-service";

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
    Connection = 'connection',
    ResponderAvailable = 'responder-available'
}

export enum OutgoingMsgType {
    ConnectionStatus = 'connection-status',
    Heartbeat = 'heartbeat',
    MissionAssigned = 'mission-assigned'
}

export type ConnectionRequestPayload = {
    responderId: string;
};

export type ResponderAvailablePayload = {
    responder: Responder;
};