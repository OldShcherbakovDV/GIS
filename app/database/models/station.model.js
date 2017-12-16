export class Station {
    constructor (session) {
        this._session = session;
    }
    create (rnID, name) {
        return this._session.run(Station.createExeption(), {
            rnID: rnID,
            name: name
        })
    }
    getByRoadNodeId(rnID) {
        const req = `
            MATCH (rn:RoadNode)--(s:Station)
            WHERE ID(rn) = $rnID
            RETURN ID(s)
        `;
        return this._session.run(req, {
            rnID: rnID
        }).then( res => {
            return res.records.length ? res.records[0].get(res.records[0].keys[0]) : undefined;
        });
    }
    static createExeption() {
        return `
            MATCH (rn:RoadNode)
            WHERE ID(rn) = $rnID
            CREATE (s:Station {name: $name})-[:Include]->(rn)
            RETURN ID(s)
        `;
    }
}