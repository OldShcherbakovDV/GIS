import {Building} from "./models/building.model";
import {Station} from "./models/station.model";
import {Route} from "./models/route.model";

const config = require('./config');
const neo4j  = require('neo4j-driver').v1;
const driver = neo4j.driver(config.uri, neo4j.auth.basic(config.user, config.password));
const session = driver.session();
import { GeoPoint } from './models/geo-point.model';
import { RoadNode } from './models/road-node.model';
import { Street }   from './models/street.model';

let db = undefined;
export class DataBase {
    static getDataBaseClient() {
        if (db === undefined) {
            db = new DataBase();
        }
        return db;
    }
    constructor() {
        this._geoPoint = new GeoPoint(session);
        this._roadNode = new RoadNode(session);
        this._building = new Building(session);
        this._street = new Street(session);
        this._route = new Route(session);
        this._station = new Station(session);
    }

    createNewStreet(name) {
        return this._street.create(name).then((res => {
            return res.records[0].get(res.records[0].keys[0])
        }));
    }

    addToStreet(streetId, roadNodeId) {
        return session.run(`
            MATCH (s:Street),(n)
            WHERE ID(s) = $sID AND ID(n) = $nID
            CREATE (s)-[:Include]->(n)
        `, {
            sID: streetId,
            nID: roadNodeId
        })
    }

    createRoad(startPointId, endPointId, roadLength) {
        return session.run(`
            MATCH (s),(e)
            WHERE ID(s) = $sID AND ID(e) = $eID
            CREATE (s)-[:Road {length: $roadLength}]->(e)
        `, {
            sID: startPointId,
            eID: endPointId,
            roadLength: roadLength
        })
    }

    createGeoPoint(longitude, latitude) {
        return this._geoPoint.create(longitude, latitude).then(res => {
            return res.records[0].get(res.records[0].keys[0])
        });
    }

    createRoadNode(longitude, latitude) {
        return this.createGeoPoint(longitude, latitude).then(id => {
            return this._roadNode.create(id).then( res => {
                return res.records[0].get(res.records[0].keys[0])
            });
        });
    }

    createNewBuilding(number, longitude, latitude) {
        return this.createGeoPoint(longitude, latitude).then(id => {
            return this._building.create(number, id).then( res => {
                return res.records[0].get(res.records[0].keys[0])
            });
        });
    }

    createStation(roadNodeId, name) {
        return this._station.create(roadNodeId, name).then( res => {
            return res.records[0].get(res.records[0].keys[0])
        });
    }

    getStationByRoadNodeId(roadNodeId) {
        return this._station.getByRoadNodeId(roadNodeId);
    }

    createRoute(name) {
        return this._route.create(name).then( res => {
            return res.records[0].get(res.records[0].keys[0])
        });
    }

    addNodeToRoute(routeID, nodeID) {

        return this._route.addNode(routeID, nodeID);
    }


    getPath(s1, b1, s2, b2) {
        const request = `
            MATCH (s1:Street)--(:RoadNode)--(n1:Building) WHERE s1.name = $s1 AND n1.number = $b1
            MATCH (s2:Street)--(:RoadNode)--(n2:Building) WHERE s2.name = $s2 AND n2.number = $b2
            MATCH p = shortestPath((n1)-[r:Road*]-(n2))
            WITH p, [x IN relationships(p) | x {id:ID(x), .*}] as roads
            RETURN roads
        `
        return session.run(request, {
            s1: s1,
            b1: b1,
            s2: s2,
            b2: b2,
        }).then(res => {
            return res.records[0].get(res.records[0].keys[0]);
        }, err => {
            console.log (err)
        })
    }

    getPathById(from, to) {
        const request = `
            MATCH p = shortestPath((from)-[r:Road*]-(to))  
            WHERE ID(from) = $from AND ID(to) = $to
            WITH p, [x IN nodes(p) | x {id:ID(x), .*}] as n
            RETURN n
        `
        return session.run(request, {
            from: from,
            to: to
        }).then(res => {
            if (res.records.length) {
                return res.records[0].get(res.records[0].keys[0]);
            }
            return [];
        }, err => {
            console.log(err)
        })
    }

    getAll(street, building) {
        return new Promise((resolved, reject) => {
            const result = {}
            const requestRoad = `
                MATCH (rn1)-[r:Road]-(rn2)
                RETURN collect(r {id: ID(r), start: ID(rn1), end: ID(rn2)})
            `;
            const requestStation = `
                MATCH (s:Station)--(rn:RoadNode)--(gp:GeoPoint)
                RETURN collect(s {id: ID(s), .*, geoPoint: gp {id: ID(gp), .*}})
            `;
            const requestRoadNode = `
                MATCH (rn:RoadNode)--(gp:GeoPoint)
                RETURN collect(rn {id: ID(rn), .*, geoPoint: gp {id: ID(gp), .*}})
            `;
            const requestBuilding = `
                MATCH (b:Building)--(gp:GeoPoint)
                RETURN collect(b {id: ID(b), .*, geoPoint: gp {id: ID(gp), .*}})
            `;
            const streetSelected = `
                MATCH (s:Street),(s)--(rn1:RoadNode)-[r:Road]-(rn2:RoadNode)--(s) 
                WHERE s.name = $name
                return collect(r {id: ID(r), .*, start: ID(rn1), end: ID(rn2)})
            `;
            const buildingSelected = `
                MATCH (s:Street),(s)--(rn1:RoadNode)--(b:Building)--(gp:GeoPoint)
                WHERE s.name = $name AND b.number = $number
                return [b {id: ID(b), .*, geoPoint: gp {id:ID(gp), .*}}]
            `;
              const p =[
                session.run(requestRoad).then(res => {
                    result.roads = res.records[0].get(res.records[0].keys[0]);
                    return true;
                }),
                session.run(requestRoadNode).then(res => {
                    result.roadNodes = res.records[0].get(res.records[0].keys[0]);
                    return true;
                }),
                session.run(requestBuilding).then(res => {
                    result.buildings = res.records[0].get(res.records[0].keys[0]);
                    return true;
                }),
                session.run(requestStation).then(res => {
                      result.stations = res.records[0].get(res.records[0].keys[0]);
                      return true;
                }),
            ]
            if (street !== undefined && building != undefined) {
                p.push(session.run(buildingSelected, {
                    name: street,
                    number: building
                }).then(res => {
                    result.selectedBuildings = res.records[0].get(res.records[0].keys[0]);
                    return true;
                }))
            } else if (street !== undefined) {
                p.push(session.run(streetSelected, {
                    name: street
                }).then(res => {
                    result.selectedRoads = res.records[0].get(res.records[0].keys[0]);
                    return true;
                }))
            }
            Promise.all(p).then(() => {
                resolved(result)
            })
        });
    }

    clear() {
        return session.run('MATCH (a) DETACH DELETE a');
    }
}

export class Generator {
    constructor(
        db,
        countStreet,
        maxStreetLenght,
        onEnd
    ) {
        this.db = db;
        this.cross = {};
        this.stations = [];
        this.db.clear().then(() => {
            this.run(countStreet, maxStreetLenght, onEnd);
        })
    }

    run(countStreet,
        maxStreetLenght,
        onEnd) {
        let startLatitude = 40;  // y ->
        let startLongitude = 40; // x ->
        const p = [];
        this.isHorisontal = false;
        for (let i = 0; i < countStreet; i++) {
            const streetLenght = getRandomInt(30, maxStreetLenght);
            let fixedPosition;
            if (this.isHorisontal) {
                fixedPosition = startLatitude;
                startLatitude += 120;
            } else {
                fixedPosition = startLongitude;
                startLongitude += 120;
            }
            p.push(this.createNewStreet(`street ${i}`, streetLenght, this.isHorisontal, fixedPosition, i));
            this.isHorisontal = !this.isHorisontal;
        }
        Promise.all(p)
            .then(() => {
                const p2 = [];
                console.log('Генерируем перекрестки')
                for (let i in this.cross) {
                    for (let j in this.cross[i]) {
                        if (this.cross[j] != undefined && this.cross[j][i] != undefined) {
                            p2.push(this.db.createRoad(this.cross[j][i].id, this.cross[i][j].id,
                                getRoadLenght(this.cross[j][i].longitude, this.cross[j][i].latitude, this.cross[i][j].longitude, this.cross[i][j].latitude)));
                        }
                    }
                }

                Promise.all(p2).then(() => {
                    console.log('Генерируем транспортную карту', this.stations.length)
                    const p3 = [];
                    let counter = 1;
                    while (this.stations.length) {

                        let from = 0;
                        let to = getRandomInt(1, this.stations.length);

                        p3.push(this.createNewRoute(this.stations[from], this.stations[to], 'Route '+ counter));
                        counter += 1;
                        this.stations.splice(0, 1);
                    }
                    Promise.all(p3).then(() => {
                        onEnd();
                    }, err => {
                        console.log(err)
                    });
                });
            })
    }
    createStation(nodeID) {
        return this.db.getStationByRoadNodeId(nodeID).then(stationID => {
            if (stationID === undefined) {
                return this.db.createStation(nodeID, 'Station ' + nodeID.toString())
            } else {
                return stationID
            }
        });
    }
    createNewRoute(from, to, name) {
        return new Promise((s, f) => {
            if (from && to) {

                this.db.getPathById(from, to).then(nodes => {
                    if (nodes && nodes.length) {
                        this.db.createRoute(name).then(routeID => {
                            const p = [];
                            let counter = 0;
                            for (let i = 0; i < nodes.length; i++) {
                                p.push(this.db.addNodeToRoute(routeID, nodes[i].id));
                                if (!counter || true) {
                                    p.push(this.createStation(nodes[i].id));
                                }
                                counter = counter > 2 ? 0 : counter + 1;
                            }
                            // if (counter) {
                            //     p.push(this.createStation(nodes.length - 1));
                            // }
                            Promise.all(p).then(s, f)
                        })
                    } else {
                        s()
                    }
                });
            } else {
                s();
            }
        });
    }
    getStationName() {

    }
    createNewStreet(streetName, streetLenght, isHorisontal, startPosition, N) {
        this.cross[N] = {};
        return new Promise( (s, f) => {
            this.db.createNewStreet(streetName)
                .then(streetID => {
                    let buildingNumber = 1;
                    let flatPosition = 40;
                    let crosCounter = 0
                    let crossId = N % 2 == 0 ? 1 : 0;
                    const getDelta = (p, number) => {
                        return number % 2 ? p + 15 : p - 15;
                    }
                    const createBuilding = (lastRoadNodeID, lastRoadLongitude, lastRoadLatitude) => {
                        if (buildingNumber < streetLenght) {
                            const currentBuildingNumber = buildingNumber;
                            const latitude = isHorisontal ? startPosition : flatPosition;
                            const longitude = isHorisontal ? flatPosition : startPosition;
                            flatPosition += 40;
                            const cid = () => `${N > crossId ? crossId : N}${N > crossId ? N : crossId}`;
                            const createNoad = () => {
                                this.db
                                    .createRoadNode(longitude, latitude)
                                    .then(roadNodeID => {
                                        if (getRandomBool()) {
                                            this.stations.push(roadNodeID)
                                        }
                                        this.db.addToStreet(streetID, roadNodeID);
                                        if (crosCounter) {
                                            const buildingLatitudeP = isHorisontal ? latitude + 15 : latitude;
                                            const buildingLongitudeP = isHorisontal ? longitude : longitude + 15;
                                            const buildingLatitudeM = isHorisontal ? latitude - 15 : latitude;
                                            const buildingLongitudeM = isHorisontal ? longitude : longitude - 15;

                                            const roadl = getRoadLenght(buildingLongitudeP, buildingLatitudeP, longitude, latitude);
                                            this.db.createNewBuilding(`${currentBuildingNumber}`, buildingLongitudeP, buildingLatitudeP)
                                                .then(buildingID => {
                                                    this.db.createRoad(roadNodeID, buildingID, roadl);
                                                });
                                            this.db.createNewBuilding(`${currentBuildingNumber + 1}`, buildingLongitudeM, buildingLatitudeM)
                                                .then(buildingID => {
                                                    this.db.createRoad(roadNodeID, buildingID, roadl);
                                                });
                                        } else {
                                            this.cross[N][crossId] = {
                                                id: roadNodeID,
                                                longitude: longitude,
                                                latitude: latitude
                                            }
                                            crossId += 2;
                                        }
                                        crosCounter = crosCounter < 2 ? crosCounter + 1 : 0;
                                        if (lastRoadNodeID !== undefined) {
                                            this.db.createRoad(lastRoadNodeID, roadNodeID, getRoadLenght(lastRoadLongitude, lastRoadLatitude, longitude, latitude));
                                        }
                                        createBuilding(roadNodeID, longitude, latitude);
                                    })
                            }
                            if (crosCounter) {
                                buildingNumber += 2;
                            }
                            createNoad();
                        } else {
                            s();
                        }
                    };
                    createBuilding();
                });
        });
    }

}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function getRoadLenght(gps_longitude, gps_latitude, gpe_longitude, gpe_latitude) {
    return Math.sqrt(Math.pow(gpe_latitude - gps_latitude,2) + Math.pow(gpe_longitude - gps_longitude,2));
}
function getRandomBool() {
    return getRandomInt(0, 2);
}
