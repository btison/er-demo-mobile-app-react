import axios, { AxiosError } from 'axios';
import { Location } from '../models/location'

export interface IDisasterSimulatorService {
    generateLocation: IGenerateLocation
}

export interface IGenerateLocation {
    (): Promise<Location>
}

export const DisasterSimulatorService: IDisasterSimulatorService = {
    generateLocation: generateLocation as IGenerateLocation
}

async function generateLocation(): Promise<Location> {
    const url = `disaster-simulator-service/g/location`;
    return axios.post<Location>(url)
        .then((response) => {
            return response.data;
        })
        .catch(ex => handleError('Error generating location', ex));
}

async function handleError(message: string, error: AxiosError): Promise<any> {
    throw new Error(message)
}
