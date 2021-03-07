export class Location {
    latitude: number;
    longitude: number;

    static of(latitude: number, longitude: number): Location {
        let location = new Location();
        location.latitude = latitude;
        location.longitude = longitude;
        return location;
    }
}