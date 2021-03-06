import axios, { AxiosError } from 'axios';
import { Shelter } from '../models/shelter';
import { DisasterCenter } from '../models/disaster-center';

export class DisasterService {

    async getShelters(): Promise<Shelter[]> {
        const url = '/disaster-service/shelters';
        return axios.get<Shelter[]>(url)
            .then((response) => {
                return response.data;
            })
            .catch(ex => this.handleError('Error getting shelters', ex));

    }

    async getDisasterCenter(): Promise<DisasterCenter> {
        const url = '/disaster-service/center';
        return axios.get<DisasterCenter>(url)
            .then((response) => {
                return response.data;
            })
            .catch(ex => this.handleError('Error getting shelters', ex));
    }

    private handleError(message: string, error: AxiosError): Promise<any> {
        console.error(`${message} ${error.message}`);
        throw new Error(message)
    }

}