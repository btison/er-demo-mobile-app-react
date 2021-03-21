import { Deque } from '@blakeembrey/deque'
import { Utils } from "../utils";
import { Location } from "./location";

export class Mission {
    id: string;
    incidentLocation: Location;
    responderLocation: ResponderLocation;
}

export class MissionStep {
    destination: boolean;
    wayPoint: boolean;
    lat: number;
    lon: number;

    static location(missionStep: MissionStep): Location {
        return Location.of(missionStep.lat, missionStep.lon);
    }

    static of(loc: Location, waypoint: boolean, destination: boolean): MissionStep {
        let step = new MissionStep();
        step.lat = loc.lat;
        step.lon = loc.lon;
        step.wayPoint = waypoint;
        step.destination = destination;
        return step;
    }
}

export class ResponderLocation {
    currentLocation: Location;
    distanceUnit: number = 0;
    waiting: boolean = false;
    status: string = 'CREATED';
    route: Deque<MissionStep>;

    static nextLocation(r: ResponderLocation): void {
        if (r.waiting === true) {
            return;
        }
        if (r.route.size === 0) {
            return;
        }
        let currentLoc = r.currentLocation;
        let step = r.route.peek(0);
        let destination = MissionStep.location(step!);
        let distance = Utils.distance(currentLoc, destination);
        let intermediateDistance: number = 0;
        while (distance * 1.3 < r.distanceUnit) {
            step = r.route.peek(0);
            if (step!.wayPoint === true || step!.destination === true) {
                break;
            }
            step = r.route.popLeft();
            currentLoc = MissionStep.location(step!);
            intermediateDistance = distance;
            step = r.route.peek(0);
            destination = MissionStep.location(step!);
            let nextDistance: number = Utils.distance(currentLoc, destination);
            distance = distance + nextDistance;
        }
        if (distance > r.distanceUnit * 1.3) {
            let intermediateLocation: Location = Utils.intermediateLocation(currentLoc, destination, r.distanceUnit - intermediateDistance);
            let intermediateStep = MissionStep.of(intermediateLocation, false, false);
            r.route.pushLeft(intermediateStep);
        }
    }

    static moveToNextLocation(r: ResponderLocation) {
        let step = r.route.popLeft();
        if (step === null) {
            return;
        }
        r.currentLocation = MissionStep.location(step);
        if (step.wayPoint === true) {
            r.waiting = true;
            r.status = 'WAITING';
        } else if (step.destination === true) {
            r.status = 'DROPPED';
        } else {
            r.status = 'MOVING';
        }
    }
}