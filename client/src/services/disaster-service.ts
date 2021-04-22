import axios, { AxiosError } from 'axios';
import { Shelter } from '../models/shelter';
import { DisasterCenter } from '../models/disaster-center';

export interface IDisasterService {
    shelters: IGetShelters;
    disasterCenter: IGetDisasterCenter;
}

export interface IGetShelters {
    (): Promise<Shelter[]>
}

export interface IGetDisasterCenter {
    (): Promise<DisasterCenter>
}

export const DisasterService: IDisasterService = {
    shelters: getShelters as IGetShelters,
    disasterCenter: getDisasterCenter as IGetDisasterCenter
}

async function getShelters(): Promise<Shelter[]> {
    const url = '/disaster-service/shelters';
    return axios.get<Shelter[]>(url)
        .then((response) => {
            return response.data;
        })
        .catch(ex => handleError('Error getting shelters', ex));

}

async function getDisasterCenter(): Promise<DisasterCenter> {
    const url = '/disaster-service/center';
    return axios.get<DisasterCenter>(url)
        .then((response) => {
            return response.data;
        })
        .catch(ex => handleError('Error getting shelters', ex));
}

function handleError(message: string, error: AxiosError): Promise<any> {
    throw new Error(message)
}
