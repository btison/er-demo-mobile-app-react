export class DisasterCenter {
    name:string;
    lat:number;
    lon:number;
    zoom:number;

    constructor (name:string, lat:number, lon:number, zoom:number) {
        this.name = name;
        this.lon = lon;
        this.lat = lat;
        this.zoom = zoom;
    }
}