import WebSocket from 'ws';
import log from '../log';
import { OutgoingMsgType } from './payloads';
import { deleteSocketDataContainer, getAllSocketDataContainers, getSocketDataContainer } from './sockets';
import { v4 as uuid } from "uuid";

export function configureSocket(ws: WebSocket) {
    const container = getSocketDataContainer(ws);

    ws.on('message', (message) => container.processMessage(message));

    ws.on('close', () => {
        log.debug('removing player socket and data container from map due to socket closure');
        deleteSocketDataContainer(ws);
    });
}

export function heartbeat(interval: number) {
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