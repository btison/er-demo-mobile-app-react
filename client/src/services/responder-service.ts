import axios, { AxiosError } from 'axios';
import { Responder } from '../models/responder';

export class ResponderService {

    async getByName(name: string): Promise<Responder> {
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
            .catch(ex => this.handleError('getResponder()', ex));
    }

    async getById(id: string): Promise<Responder> {
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
            .catch(ex => this.handleError('getResponder()', ex));
    }

    async create(responder: Responder, get: boolean): Promise<Responder> {
        const url = `responder-service/responder`;
        return axios.post(url, responder)
            .then((response) => {
                let location = response.headers['location'];
                if (location) {
                    const url = new URL(location);
                    let id = url.pathname.split('/').pop();
                    if (id !== undefined) {
                        return this.getById(id);
                    }
                }
                return new Responder();
            })
            .catch(ex => this.handleError('getResponder()', ex));
    }

    private handleError(method: string, error: AxiosError): Promise<any> {
        console.error(`${method} ${error.message}`);
        //TODO: toast
        return new Promise((resolve) => {
            resolve(null);
        })
    }

}