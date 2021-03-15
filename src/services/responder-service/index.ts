import { isPerson } from "./responder-service";

export interface IResponderService {
    isPerson: IGetPerson;
}

export interface IGetPerson {
    (id: string): Promise<boolean>
}

export const ResponderService: IResponderService = {
    isPerson: isPerson as IGetPerson
};