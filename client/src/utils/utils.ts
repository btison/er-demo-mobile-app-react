import { Location } from '../models/location';

const radius: number = 6371; // Radius of the earth

export function random(min: number, max: number): number {
    return (Math.random() * (max - min)) + min;
}

export function distance(loc1: Location, loc2: Location): number {
    return _distance(loc1.lat, loc1.lon, loc2.lat, loc2.lon);
}

function _distance(lat1: number, lon1: number, lat2: number, lon2: number): number {

    let latDistance: number = toRadians(lat2 - lat1);
    let lonDistance: number = toRadians(lon2 - lon1);
    let a: number = Math.sin(latDistance / 2) * Math.sin(latDistance / 2) + Math.cos(toRadians(lat1))
        * Math.cos(toRadians(lat2)) * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
    let c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return radius * c * 1000;
}

export function intermediateLocation(loc1: Location, loc2: Location, distance: number): Location {
    let latR1 = toRadians(loc1.lat);
    let latR2 = toRadians(loc2.lat);
    let lonR1 = toRadians(loc1.lon);
    let longDiff = toRadians(loc2.lon - loc1.lon);
    let y = Math.sin(longDiff) * Math.cos(latR2);
    let x = Math.cos(latR1) * Math.sin(latR2) - Math.sin(latR1) * Math.cos(latR2) * Math.cos(longDiff);

    let bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;

    let bearingR = toRadians(bearing);

    let distFrac = distance / (radius * 1000);

    let a = Math.sin(distFrac) * Math.cos(latR1);
    let latDest = Math.asin(Math.sin(latR1) * Math.cos(distFrac) + a * Math.cos(bearingR));
    let lonDest = lonR1 + Math.atan2(Math.sin(bearingR) * a, Math.cos(distFrac) - Math.sin(latR1) * Math.sin(latDest));

    return Location.of(parseFloat(toDegrees(latDest).toFixed(4)), parseFloat(toDegrees(lonDest).toFixed(4)));
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}