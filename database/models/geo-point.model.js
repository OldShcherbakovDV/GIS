export class GeoPoint {
    constructor (session) {
        this._session = session;
    }
    create (longitude, latitude) {
        return this._session.run(GeoPoint.createExeption(), {
            longitude: longitude,
            latitude: latitude
        })
    }
    static createExeption() {
        return `CREATE (gp:GeoPoint {longitude: $longitude, latitude: $latitude}) RETURN ID(gp)`;
    }
}