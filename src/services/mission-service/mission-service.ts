const missions = new Map<string, Mission>();

export function put(mission: Mission) {
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

export interface LocationHistory {
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
    responderLocationHistory: LocationHistory[];
    steps: MissionStep[];
    status: string;
}

export class MissionStep {
    destination: boolean;
    wayPoint: boolean;
    lat: number;
    lon: number;
}