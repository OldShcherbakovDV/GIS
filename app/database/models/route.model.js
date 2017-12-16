export class Route {
    constructor (session) {
        this._session = session;
    }
    create (name) {
        return this._session.run(Route.createExeption(), {
            name: name
        })
    }

    addNode(routeId, nodeId) {
        const req = `
            MATCH (r:Route) WHERE ID(r) = $rID
            MATCH (n:RoadNode) WHERE ID(n) = $nID
            CREATE (r)-[:Include]->(n)
            RETURN r, n
        `
        return this._session.run(req, {
            rID: routeId,
            nID: nodeId
        })
    }

    static createExeption() {
        return `
            CREATE (s:Route {name: $name})
            RETURN ID(s)
        `;
    }
}