import log from "../../log";
import { ResponderSimulatorService } from "../responder-simulator";

const missions = new Map<string, Mission>();

export function put(mission: Mission) {
    let route = new Route();
    route.currentLocation = { timestamp: 0, lat: mission.responderStartLat, lon: mission.responderStartLong };
    route.route = mission.steps;
    mission.responderLocation = route;
    missions.set(mission.responderId, mission);
}

export function get(id: string): Mission | null {
    if (missions.has(id)) {
        return missions.get(id)!;
    } else {
        return null;
    }
}

function remove(id: string): void {
    missions.delete(id);
}

export function update(id: string, route: Route): void {
    if (missions.has(id)) {
        log.debug('Updating mission ' + id + ': ' + JSON.stringify(route));
        const mission = missions.get(id);
        mission!.responderLocation = route;
        if (route.status === 'DROPPED') {
            missions.delete(id);
        }
        ResponderSimulatorService.update(mission!.id, route);
    } else {
        log.warn(`Mission with id ${id} not found`);
    }
}

export interface Location {
    timestamp: number;
    lat: number;
    lon: number;
}

export class Mission {
    id: string;
    incidentId: string;
    responderId: string;
    responderStartLat: number;
    responderStartLong: number;
    incidentLat: number;
    incidentLong: number;
    destinationLat: number;
    destinationLong: number;
    responderLocationHistory: Location[];
    steps: MissionStep[];
    status: string;
    responderLocation: Route
}

export class MissionStep {
    destination: boolean;
    wayPoint: boolean;
    lat: number;
    lon: number;
}

export class Route {
    currentLocation: Location;
    waiting: boolean = false;
    status: string = 'CREATED';
    route: MissionStep[] = [];
}
