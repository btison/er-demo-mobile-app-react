import axios, { AxiosError } from 'axios';
import { RESPONDER_SERVICE } from '../../config';
import log from '../../log';

async function getById(id: string): Promise<Responder> {
    const url = RESPONDER_SERVICE + `/responder/${id}`;
    return axios.get<Responder>(url, {
        validateStatus: (status) => status < 500
    })
        .then((response) => {
            if (response.status === 404) {
                return null;
            }
            return response.data;
        })
        .catch(ex => handleError('Error retrieving responder by id', ex));
}

export async function isPerson(id: string): Promise<boolean> {
    return getById(id).then((responder) => {
        if (responder === null) {
            return false;
        }
        if (!responder.person) {
            return false;
        } else {
            return responder.person;
        }
    }).catch(() => { return false });
}

export async function update(responder: Responder): Promise<void> {
    log.debug('update responder ' + responder.id);
    const url = RESPONDER_SERVICE + '/responder';
    axios.put(url, {
        id: responder.id, enrolled: responder.enrolled, available: responder.available,
        latitude: responder.latitude, longitude: responder.longitude
    })
        .catch(ex => handleError('Error updating responderLocation', ex));
}

async function handleError(message: string, error: AxiosError): Promise<any> {
    console.error(`${message} ${error.message}`);
    throw new Error(message)
}

export class Responder {
    id = "0";
    name?: string;
    phoneNumber?: string;
    latitude?: number;
    longitude?: number;
    boatCapacity?: number;
    medicalKit?: boolean;
    available?: boolean;
    person?: boolean;
    enrolled?: boolean;
}