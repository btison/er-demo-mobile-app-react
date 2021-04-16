import SocketDataContainer from "./socket-container";
import WebSocket from 'ws';
import log from "../log";

let sockets = new Map<WebSocket, SocketDataContainer>();

export function getSocketDataContainer(ws: WebSocket) {
    let container = sockets.get(ws);

    if (!container) {
        log.debug('adding new socket and data container to map');

        container = new SocketDataContainer(ws);

        sockets.set(ws, container);
    }

    return container;
}

export function deleteSocketDataContainer(ws: WebSocket) {
    sockets.get(ws)?.close();
    sockets.delete(ws);
}

export function getAllSocketDataContainers() {
    return sockets;
}

export function getSocketDataContainerByResponder(id: string): SocketDataContainer | null {
    log.debug(`starting socket lookup for responder ${id}`);
    for (const entry of sockets) {
        if (entry[1].getResponderId() === id) {
            log.debug(`socket lookup success for responder ${id}`);
            return entry[1];
        }
    }
    log.debug(`socket lookup for fail for responder ${id}`);
    return null;
}