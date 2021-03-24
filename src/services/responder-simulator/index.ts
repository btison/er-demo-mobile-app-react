import { Route } from "../mission-service/mission-service";
import { updateResponderLocation } from './responder-simulator';

export interface IResponderSimulatorService {
    update: IUpdate;
}

export interface IUpdate {
    (id: string, route: Route): Promise<void>
}

export const ResponderSimulatorService: IResponderSimulatorService = {
    update: updateResponderLocation as IUpdate
}