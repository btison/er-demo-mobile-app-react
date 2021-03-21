import axios, { AxiosError } from 'axios';
import { Location } from '../models/location';
import { Mission, ResponderLocation } from '../models/mission';
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
                mission.responderLocation = new ResponderLocation();
                mission.responderLocation.currentLocation = Location.of(data.responderStartLat, data.responderStartLong)
                mission.responderLocation.route = new Deque(data.steps);
                return mission;
            })
            .catch(ex => this.handleError('Error fetching mission', ex));
    }

    private handleError(message: string, error: AxiosError): Promise<any> {
        console.error(`${message} ${error.message}`);
        throw new Error(message)
    }
}