import log from "../log";
import { ConnectionRequestPayload, IncomingMsgType, OutgoingMsgType, WsOutgoingPayload, WsIncomingPayload } from "./payloads";
import SocketDataContainer from "./socket-container";
import { v4 as uuid } from "uuid";
import { getSocketDataContainerByResponder } from "./sockets";
import { Mission } from "../services/mission-service/mission-service";

type MessageHandlersContainer = {
    [key in IncomingMsgType]: {
        fn: MessageHandler<any, any>;
    };
};

type MessageHandler<IncomingType, ResponseType> = (
    ws: SocketDataContainer,
    data: IncomingType
) => Promise<void>;

const connectionHandler: any = async (container: SocketDataContainer, data: ConnectionRequestPayload) => {
    log.debug('Received connection request message: ' + JSON.stringify(data));

    // If the responder successfully reconnected, then we need to ensure their
    // previous socket is closed to prevent any funny business or odd
    // behaviour. The previous socket can be found closed their responder ID
    // TODO: manage current state
    let c = getSocketDataContainerByResponder(data.responderId);
    if (c != null) {
        log.info(`responder ${data.responderId} reconnected. Removing previous socket from pool if it exists.`
        );
        c?.close();
    }
    container.setResponderId(data.responderId);
    container.send({
        id: uuid(),
        type: OutgoingMsgType.ConnectionStatus,
        data: { status: 'ok' }
    });
};

const MessageHandlers: MessageHandlersContainer = {
    [IncomingMsgType.Connection]: {
        fn: connectionHandler
    }
};

export async function processSocketMessage(container: SocketDataContainer, payload: WsIncomingPayload) {
    log.debug('finding handler for message: %j', payload);
    const handler = MessageHandlers[payload.type];

    if (handler) {
        return handler.fn(container, payload.data);
    } else {
        throw new HandlerNotFoundError(payload.type);
    }
}

export class HandlerNotFoundError extends Error {
    constructor(public type: string) {
        super();
    }
}

export async function sendMission(responder: string, mission: Mission) {
    log.debug('sending mission for responder ' + responder);
    let sdc = getSocketDataContainerByResponder(responder);
    if (sdc === null) {
        console.warn('no socketdatacontainer found for responder ' + responder);
    } else {

        sdc.send({
            id: uuid(),
            type: OutgoingMsgType.MissionAssigned,
            data: mission
        });
    };
}