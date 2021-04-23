import WebSocket from 'ws';
import log from '../log';
import { OutgoingMsgType } from './payloads';
import { deleteSocketDataContainer, getAllSocketDataContainers, getSocketDataContainer } from './sockets';
import { v4 as uuid } from "uuid";
import { Mission } from '../services/mission-service/mission-service';
import { missionAssigned, responderUpdated } from './handlers';
import { ResponderService } from '../services/responder-service';
import { Responder } from '../services/responder-service/responder-service';

export interface ISocketService {
    heartbeat: IHeartBeat;
    missionAssigned: IMissionAssigned;
    responderUpdated: IResponderUpdated;
}

export interface IHeartBeat {
    (interval: number): void
}

export interface IMissionAssigned {
    (responderId: string, mission: Mission): void
}

export interface IResponderUpdated {
    (responder: Responder): void
}

export const SocketService: ISocketService = {
    heartbeat: heartbeat as IHeartBeat,
    missionAssigned: missionAssigned as IMissionAssigned,
    responderUpdated: responderUpdated as IResponderUpdated
}

export function configureSocket(ws: WebSocket) {
    const container = getSocketDataContainer(ws);

    ws.on('message', (message) => container.processMessage(message));

    ws.on('close', () => {
        log.debug('removing player socket and data container from map due to socket closure');
        deleteSocketDataContainer(ws);
        ResponderService
    });
}

async function heartbeat(interval: number) {
    const clients = getAllSocketDataContainers();

    if (clients.size > 0) {
        log.debug(`sending heartbeat to ${clients.size} client(s)`);

        clients.forEach((client) => {
            client.send({
                id: uuid(),
                type: OutgoingMsgType.Heartbeat,
                data: {}
            });
        });

        log.debug(`finished heartbeat send for ${clients.size} client(s)`);
    }

    setTimeout(() => heartbeat(interval), interval);
}