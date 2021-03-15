import axios, { AxiosError } from 'axios';
import { Mission } from '../models/mission';

export class MissionService {

    async get(id: string): Promise<Mission | null> {
        const url = `mission-service/mission/${id}`;
        return axios.get<Mission>(url, {
            validateStatus: (status) => status < 500
        })
            .then((response) => {
                if (response.status === 404) {
                    return null;
                }
                return response.data;
            })
            .catch(ex => this.handleError('Error fetching mission', ex));     

    }

    private handleError(message: string, error: AxiosError): Promise<any> {
        console.error(`${message} ${error.message}`);
        throw new Error(message)
    }
}