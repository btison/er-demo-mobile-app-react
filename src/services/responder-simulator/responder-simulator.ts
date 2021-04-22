import axios, { AxiosError } from 'axios';
import { RESPONDER_SIMULATOR } from '../../config';
import log from '../../log';
import { Route } from '../mission-service/mission-service';

export async function updateResponderLocation(id: string, route: Route): Promise<void> {
    const url = RESPONDER_SIMULATOR + '/api/mission';
    return axios.post(url, {
        missionId: id, lat: route.currentLocation.lat, lon: route.currentLocation.lon, status: route.status
    })
        .catch(ex => handleError('Error updating responderLocation', ex));
}

async function handleError(message: string, error: AxiosError): Promise<any> {
    log.error(`${message} ${error.message}`);
    throw new Error(message)
}