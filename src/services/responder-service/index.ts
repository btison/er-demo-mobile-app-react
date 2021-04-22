import { isPerson, Responder, update } from "./responder-service";

export interface IResponderService {
    isPerson: IGetPerson;
    update: IUpdate;
}

export interface IGetPerson {
    (id: string): Promise<boolean>
}

export interface IUpdate {
    (responder: Responder): Promise<void>
}

export const ResponderService: IResponderService = {
    isPerson: isPerson as IGetPerson,
    update: update as IUpdate
};