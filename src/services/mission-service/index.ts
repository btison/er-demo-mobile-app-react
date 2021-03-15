import { get, put, Mission } from "./mission-service";

export interface IMissionService {
    put: ISave;
    get: IGetByResponder;
}

export interface ISave {
    (mission: Mission): void
}

export interface IGetByResponder {
    (id: string): Mission | null;
}

export const MissionService: IMissionService = {
    put: put as ISave,
    get: get as IGetByResponder
}