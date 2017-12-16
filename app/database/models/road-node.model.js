export class RoadNode {
    constructor (session) {
        this._session = session;
    }
    create (geoPointId) {
        return this._session.run(RoadNode.createExeption(), {
            geoPointId: geoPointId
        })
    }
    static createExeption() {
        return `
            MATCH (gp:GeoPoint)
            WHERE ID(gp) = $geoPointId
            CREATE (rn:RoadNode)-[:Include]->(gp)
            RETURN ID(rn)
        `;
    }
}