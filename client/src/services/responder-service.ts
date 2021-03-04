import axios, { AxiosError } from 'axios';
import { Responder } from '../models/responder';

export class ResponderService {

    async getByName(name: String): Promise<Responder> {
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

    private handleError(method: string, error: AxiosError): Promise<any> {
        console.error(`${method} ${error.message}`);
        //TODO: toast
        return new Promise((resolve) => {
            resolve(null);
        })
    }

}