import { get, put, update, Mission, Route } from "./mission-service";

export interface IMissionService {
    put: ISave;
    get: IGetByResponder;
    update: IUpdate;
}

export interface ISave {
    (mission: Mission): void
}

export interface IGetByResponder {
    (id: string): Mission | null;
}

export interface IUpdate {
    (id: string, r: Route): void;
}

export const MissionService: IMissionService = {
    put: put as ISave,
    get: get as IGetByResponder,
    update: update as IUpdate
}