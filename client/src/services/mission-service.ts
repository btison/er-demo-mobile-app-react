import axios, { AxiosError } from 'axios';
import { MissionStep, Route } from '../models/mission';

export class MissionService {

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