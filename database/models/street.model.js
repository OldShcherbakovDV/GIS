export class Street {
    constructor (session) {
        this._session = session;
    }
    create (name) {
        return this._session.run(Street.createExeption(), {
            name: name
        })
    }
    static createExeption() {
        return `
            CREATE (s:Street {name: $name})
            RETURN ID(s)
        `;
    }
}