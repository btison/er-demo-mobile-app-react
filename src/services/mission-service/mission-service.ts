const missions = new Map<string, Mission>();

export function put(mission: Mission) {
    let responderLocation = new Route();
    responderLocation.currentLocation = {timestamp: 0, lat: mission.responderStartLat, lon: mission.responderStartLong};
    responderLocation.route = mission.steps;
    mission.responderLocation = responderLocation;
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
