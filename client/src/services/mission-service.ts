import axios, { AxiosError } from 'axios';
import { Location } from '../models/location';
import { Mission, MissionStep, Route } from '../models/mission';
import { Deque } from '@blakeembrey/deque'

export class MissionService {

    async get(id: string): Promise<Mission | null> {
        const url = `mission-service/mission/${id}`;
        return axios.get<any>(url, {
            validateStatus: (status) => status < 500
        })
            .then((response) => {
                if (response.status === 404) {
                    return null;
                }
                let data = response.data;
                const mission = new Mission();
                mission.id = data.id;
                mission.incidentLocation = Location.of(data.incidentLat, data.incidentLong);
                mission.route = new Route();
                mission.route.currentLocation = Location.of(data.responderStartLat, data.responderStartLong)
                mission.route.route = new Deque(data.steps);
                return mission;
            })
            .catch(ex => this.handleError('Error fetching mission', ex));
    }

    async update(id: string, route: Route): Promise<void> {
        const url = `mission-service/mission/${id}`;
        return axios.post(url, {
            currentLocation: { lat: route.currentLocation.lat, lon: route.currentLocation.lon },
            waiting: route.waiting, status: route.status,
            route: Array.from<MissionStep>(route.route.values()).map((m: MissionStep) => ({ destination: m.destination, waypoint: m.wayPoint, lat: m.lat, lon: m.lon }))
        })
            .catch(ex => this.handleError('Error updating mission', ex));
    }

    private handleError(message: string, error: AxiosError): Promise<any> {
        console.error(`${message} ${error.message}`);
        throw new Error(message)
    }
}