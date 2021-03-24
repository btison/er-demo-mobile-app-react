import axios, { AxiosError } from 'axios';

async function getById(id: string): Promise<Responder> {
    const url = process.env.RESPONDER_SERVICE + `/responder/${id}`;
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
    }).catch(() => {return false});
}

async function handleError(message: string, error: AxiosError): Promise<any> {
    console.error(`${message} ${error.message}`);
    throw new Error(message)
}

class Responder {
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