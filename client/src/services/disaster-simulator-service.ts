import axios, { AxiosError } from 'axios';
import { Location } from '../models/location'

export class DisasterSimulatorService {

    async generateLocation(): Promise<Location> {
        const url = `disaster-simulator-service/g/location`;
        return axios.post<Location>(url)
            .then((response) => {
                return response.data;
            })
            .catch(ex => this.handleError('Error generating location', ex));
    }

    private handleError(message: string, error: AxiosError): Promise<any> {
        console.error(`${message} ${error.message}`);
        throw new Error(message)
    }

}