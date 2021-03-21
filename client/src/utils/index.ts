import { Location } from '../models/location';
import { distance, intermediateLocation, random } from "./utils";

export interface IUtils {
    random: IRandom;
    distance: IDistance;
    intermediateLocation: IIintermediateLocation;
}

export interface IRandom {
    (min: number, max: number): number;
}

export interface IDistance {
    (loc1: Location, loc2: Location): number;
}

export interface IIintermediateLocation {
    (loc1: Location, loc2: Location, distance: number): Location;
}

export const Utils: IUtils = {
    random: random as IRandom,
    distance: distance as IDistance,
    intermediateLocation: intermediateLocation as IIintermediateLocation
}