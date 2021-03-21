export class Location {
    lat: number;
    lon: number;

    static of(lat: number, lon: number): Location {
        let location = new Location();
        location.lat = lat;
        location.lon = lon;
        return location;
    }
}