import axios, { AxiosError } from 'axios';
import { Responder } from '../models/responder';

export interface IResponderService {
    getByName: IGetByName;
    getById: IGetById;
    create: ICreate;
}

export interface IGetByName {
    (name: string): Promise<Responder>
}

export interface IGetById {
    (id: string): Promise<Responder>
}

export interface ICreate {
    (responder: Responder, get: boolean): Promise<Responder>
}

export const ResponderService: IResponderService = {
    getByName: getByName as IGetByName,
    getById: getById as IGetById,
    create: create as ICreate
}

async function getByName(name: string): Promise<Responder> {
    const url = `responder-service/responder/byname/${name}`;
    return axios.get<Responder>(url, {
        validateStatus: (status) => status < 500
    })
        .then((response) => {
            if (response.status === 404) {
                return new Responder();
            }
            return response.data;
        })
        .catch(ex => handleError('Error retrieving responder by name', ex));
}

async function getById(id: string): Promise<Responder> {
    const url = `responder-service/responder/${id}`;
    return axios.get<Responder>(url, {
        validateStatus: (status) => status < 500
    })
        .then((response) => {
            if (response.status === 404) {
                return new Responder();
            }
            return response.data;
        })
        .catch(ex => handleError('Error retrieving responder by id', ex));
}

async function create(responder: Responder, get: boolean): Promise<Responder> {
    const url = `responder-service/responder`;
    return axios.post(url, responder)
        .then((response) => {
            let location = response.headers['location'];
            if (location) {
                const url = new URL(location);
                let id = url.pathname.split('/').pop();
                if (id !== undefined) {
                    return getById(id);
                }
            }
            return new Responder();
        })
        .catch(ex => handleError('Error creating responder', ex));
}

function handleError(message: string, error: AxiosError): Promise<any> {
    throw new Error(message)
}
