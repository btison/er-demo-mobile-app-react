import { isRegistered, register, Responder, unregister, update } from "./responder-service";

export interface IResponderService {
    update: IUpdate;
    register: IRegister;
    unregister: IRegister;
    isRegistered: IIsRegistered;

}

export interface IUpdate {
    (responder: Responder): Promise<void>;
}

export interface IRegister {
    (id: string): void;
}

export interface IIsRegistered {
    (id: string): boolean;
}

export const ResponderService: IResponderService = {
    update: update as IUpdate,
    register: register as IRegister,
    unregister: unregister as IRegister,
    isRegistered: isRegistered as IIsRegistered
};