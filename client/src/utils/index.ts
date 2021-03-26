import { Location } from '../models/location';
import { distance, intermediateLocation, random, initGeoJson } from "./utils";

export interface IUtils {
    random: IRandom;
    distance: IDistance;
    intermediateLocation: IIintermediateLocation;
    initGeoJson: IInitGeoJson;
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

export interface IInitGeoJson {
    (): GeoJSON.FeatureCollection<GeoJSON.LineString>
}

export const Utils: IUtils = {
    random: random as IRandom,
    distance: distance as IDistance,
    intermediateLocation: intermediateLocation as IIintermediateLocation,
    initGeoJson: initGeoJson as IInitGeoJson
}