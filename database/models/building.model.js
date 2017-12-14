export class Building {
    constructor (session) {
        this._session = session;
    }
    create (number, geoPointId) {
        return this._session.run(Building.createExeption(), {
            geoPointId: geoPointId,
            number: number
        })
    }
    static createExeption() {
        return `
            MATCH (gp:GeoPoint)
            WHERE ID(gp) = $geoPointId
            CREATE (rn:Building {number: $number})-[:Include]->(gp)
            RETURN ID(rn)
        `;
    }
}