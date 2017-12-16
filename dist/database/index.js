"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Generator = exports.DataBase = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _building = require("./models/building.model");

var _station = require("./models/station.model");

var _route = require("./models/route.model");

var _geoPoint = require("./models/geo-point.model");

var _roadNode = require("./models/road-node.model");

var _street = require("./models/street.model");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var config = require('./config');
var neo4j = require('neo4j-driver').v1;
var driver = neo4j.driver(config.uri, neo4j.auth.basic(config.user, config.password));
var session = driver.session();


var db = undefined;

var DataBase = exports.DataBase = function () {
    _createClass(DataBase, null, [{
        key: "getDataBaseClient",
        value: function getDataBaseClient() {
            if (db === undefined) {
                db = new DataBase();
            }
            return db;
        }
    }]);

    function DataBase() {
        _classCallCheck(this, DataBase);

        this._geoPoint = new _geoPoint.GeoPoint(session);
        this._roadNode = new _roadNode.RoadNode(session);
        this._building = new _building.Building(session);
        this._street = new _street.Street(session);
        this._route = new _route.Route(session);
        this._station = new _station.Station(session);
    }

    _createClass(DataBase, [{
        key: "createNewStreet",
        value: function createNewStreet(name) {
            return this._street.create(name).then(function (res) {
                return res.records[0].get(res.records[0].keys[0]);
            });
        }
    }, {
        key: "addToStreet",
        value: function addToStreet(streetId, roadNodeId) {
            return session.run("\n            MATCH (s:Street),(n)\n            WHERE ID(s) = $sID AND ID(n) = $nID\n            CREATE (s)-[:Include]->(n)\n        ", {
                sID: streetId,
                nID: roadNodeId
            });
        }
    }, {
        key: "createRoad",
        value: function createRoad(startPointId, endPointId, roadLength) {
            return session.run("\n            MATCH (s),(e)\n            WHERE ID(s) = $sID AND ID(e) = $eID\n            CREATE (s)-[:Road {length: $roadLength}]->(e)\n        ", {
                sID: startPointId,
                eID: endPointId,
                roadLength: roadLength
            });
        }
    }, {
        key: "createGeoPoint",
        value: function createGeoPoint(longitude, latitude) {
            return this._geoPoint.create(longitude, latitude).then(function (res) {
                return res.records[0].get(res.records[0].keys[0]);
            });
        }
    }, {
        key: "createRoadNode",
        value: function createRoadNode(longitude, latitude) {
            var _this = this;

            return this.createGeoPoint(longitude, latitude).then(function (id) {
                return _this._roadNode.create(id).then(function (res) {
                    return res.records[0].get(res.records[0].keys[0]);
                });
            });
        }
    }, {
        key: "createNewBuilding",
        value: function createNewBuilding(number, longitude, latitude) {
            var _this2 = this;

            return this.createGeoPoint(longitude, latitude).then(function (id) {
                return _this2._building.create(number, id).then(function (res) {
                    return res.records[0].get(res.records[0].keys[0]);
                });
            });
        }
    }, {
        key: "createStation",
        value: function createStation(roadNodeId, name) {
            return this._station.create(roadNodeId, name).then(function (res) {
                return res.records[0].get(res.records[0].keys[0]);
            });
        }
    }, {
        key: "getStationByRoadNodeId",
        value: function getStationByRoadNodeId(roadNodeId) {
            return this._station.getByRoadNodeId(roadNodeId);
        }
    }, {
        key: "createRoute",
        value: function createRoute(name) {
            return this._route.create(name).then(function (res) {
                return res.records[0].get(res.records[0].keys[0]);
            });
        }
    }, {
        key: "addNodeToRoute",
        value: function addNodeToRoute(routeID, nodeID) {
            return this._route.addNode(routeID, nodeID);
        }
    }, {
        key: "getPath",
        value: function getPath(s1, b1, s2, b2) {
            var request = "\n            MATCH (s1:Street)--(:RoadNode)--(n1:Building) WHERE s1.name = $s1 AND n1.number = $b1\n            MATCH (s2:Street)--(:RoadNode)--(n2:Building) WHERE s2.name = $s2 AND n2.number = $b2\n            MATCH p = shortestPath((n1)-[r:Road*]-(n2))\n            WITH p, [x IN relationships(p) | x {id:ID(x), .*}] as roads\n            RETURN roads\n        ";
            return session.run(request, {
                s1: s1,
                b1: b1,
                s2: s2,
                b2: b2
            }).then(function (res) {
                return res.records[0].get(res.records[0].keys[0]);
            }, function (err) {
                console.log(err);
            });
        }
    }, {
        key: "getPathById",
        value: function getPathById(from, to) {
            var request = "\n            MATCH p = shortestPath((from)-[r:Road*]-(to))  \n            WHERE ID(from) = $from AND ID(to) = $to\n            WITH p, [x IN nodes(p) | x {id:ID(x), .*}] as n\n            RETURN n\n        ";
            return session.run(request, {
                from: from,
                to: to
            }).then(function (res) {
                return res.records[0].get(res.records[0].keys[0]);
            }, function (err) {
                console.log(err);
            });
        }
    }, {
        key: "getAll",
        value: function getAll(street, building) {
            return new Promise(function (resolved, reject) {
                var result = {};
                var requestRoad = "\n                MATCH (rn1)-[r:Road]-(rn2)\n                RETURN collect(r {id: ID(r), start: ID(rn1), end: ID(rn2)})\n            ";
                var requestRoadNode = "\n                MATCH (rn:RoadNode)--(gp:GeoPoint)\n                RETURN collect(rn {id: ID(rn), .*, geoPoint: gp {id: ID(gp), .*}})\n            ";
                var requestBuilding = "\n                MATCH (b:Building)--(gp:GeoPoint)\n                RETURN collect(b {id: ID(b), .*, geoPoint: gp {id: ID(gp), .*}})\n            ";
                var streetSelected = "\n                MATCH (s:Street),(s)--(rn1:RoadNode)-[r:Road]-(rn2:RoadNode)--(s) \n                WHERE s.name = $name\n                return collect(r {id: ID(r), .*, start: ID(rn1), end: ID(rn2)})\n            ";
                var buildingSelected = "\n                MATCH (s:Street),(s)--(rn1:RoadNode)--(b:Building)--(gp:GeoPoint)\n                WHERE s.name = $name AND b.number = $number\n                return [b {id: ID(b), .*, geoPoint: gp {id:ID(gp), .*}}]\n            ";
                var p = [session.run(requestRoad).then(function (res) {
                    result.roads = res.records[0].get(res.records[0].keys[0]);
                    return true;
                }), session.run(requestRoadNode).then(function (res) {
                    result.roadNodes = res.records[0].get(res.records[0].keys[0]);
                    return true;
                }), session.run(requestBuilding).then(function (res) {
                    result.buildings = res.records[0].get(res.records[0].keys[0]);
                    return true;
                })];
                if (street !== undefined && building != undefined) {
                    p.push(session.run(buildingSelected, {
                        name: street,
                        number: building
                    }).then(function (res) {
                        console.log(res.records, building);
                        result.selectedBuildings = res.records[0].get(res.records[0].keys[0]);
                        return true;
                    }));
                } else if (street !== undefined) {
                    p.push(session.run(streetSelected, {
                        name: street
                    }).then(function (res) {
                        result.selectedRoads = res.records[0].get(res.records[0].keys[0]);
                        return true;
                    }));
                }
                Promise.all(p).then(function () {
                    resolved(result);
                });
            });
        }
    }, {
        key: "clear",
        value: function clear() {
            return session.run('MATCH (a) DETACH DELETE a');
        }
    }]);

    return DataBase;
}();

var Generator = exports.Generator = function () {
    function Generator(db, countStreet, maxStreetLenght, onEnd) {
        var _this3 = this;

        _classCallCheck(this, Generator);

        this.db = db;
        this.cross = {};
        this.stations = [];
        this.db.clear().then(function () {
            _this3.run(countStreet, maxStreetLenght, onEnd);
        });
    }

    _createClass(Generator, [{
        key: "run",
        value: function run(countStreet, maxStreetLenght, onEnd) {
            var _this4 = this;

            var startLatitude = 40; // y ->
            var startLongitude = 40; // x ->
            var p = [];
            this.isHorisontal = false;
            for (var i = 0; i < countStreet; i++) {
                var streetLenght = getRandomInt(10, maxStreetLenght);
                var fixedPosition = void 0;
                if (this.isHorisontal) {
                    fixedPosition = startLatitude;
                    startLatitude += 120;
                } else {
                    fixedPosition = startLongitude;
                    startLongitude += 120;
                }
                p.push(this.createNewStreet("street " + i, streetLenght, this.isHorisontal, fixedPosition, i));
                this.isHorisontal = !this.isHorisontal;
            }
            Promise.all(p).then(function () {
                var p2 = [];
                console.log(JSON.stringify(_this4.cross));
                for (var _i in _this4.cross) {
                    for (var j in _this4.cross[_i]) {
                        if (_this4.cross[j] != undefined && _this4.cross[j][_i] != undefined) {
                            p2.push(_this4.db.createRoad(_this4.cross[j][_i].id, _this4.cross[_i][j].id, getRoadLenght(_this4.cross[j][_i].longitude, _this4.cross[j][_i].latitude, _this4.cross[_i][j].longitude, _this4.cross[_i][j].latitude)));
                        }
                    }
                }
                var counter = 1;
                while (_this4.stations.length) {
                    var from = 0;
                    var to = getRandomInt(1, _this4.stations.length + 1);
                    p2.push(_this4.createNewPath(_this4.stations[from], _this4.stations[to]), 'Route ' + counter);
                    counter += 1;
                    _this4.stations.splice(0, 1);
                }
                Promise.all(p2).then(function () {
                    onEnd();
                });
            });
        }
    }, {
        key: "createStation",
        value: function createStation(nodeID) {
            var _this5 = this;

            return this.db.getStationByRoadNodeId(nodeID).then(function (stationID) {
                if (stationID === undefined) {
                    return _this5.db.createStation(nodeID, 'Station ' + nodeID.toString());
                } else {
                    return stationID;
                }
            });
        }
    }, {
        key: "createNewPath",
        value: function createNewPath(from, to, name) {
            var _this6 = this;

            return new Promise(function (s, f) {
                _this6.db.getPathById(from, to).then(function (nodes) {
                    _this6.db.createRoute(name).then(function (routeID) {
                        var p = [];
                        var counter = 0;
                        for (var i in nodes) {
                            p.push(_this6.db.addNodeToRoute(routeID, nodes[i]));
                            if (!counter) {
                                p.push(_this6.createStation(nodes[i]));
                            }
                            counter = counter > 2 ? 0 : counter + 1;
                        }
                        if (counter) {
                            p.push(_this6.createStation(nodes.length - 1));
                        }
                        Promise.all(p).then(s, f);
                    });
                });
            });
        }
    }, {
        key: "getStationName",
        value: function getStationName() {}
    }, {
        key: "createNewStreet",
        value: function createNewStreet(streetName, streetLenght, isHorisontal, startPosition, N) {
            var _this7 = this;

            this.cross[N] = {};
            return new Promise(function (s, f) {
                _this7.db.createNewStreet(streetName).then(function (streetID) {
                    var buildingNumber = 1;
                    var flatPosition = 40;
                    var crosCounter = 0;
                    var crossId = N % 2 == 0 ? 1 : 0;
                    var getDelta = function getDelta(p, number) {
                        return number % 2 ? p + 15 : p - 15;
                    };
                    var createBuilding = function createBuilding(lastRoadNodeID, lastRoadLongitude, lastRoadLatitude) {
                        if (buildingNumber < streetLenght) {
                            var currentBuildingNumber = buildingNumber;
                            var latitude = isHorisontal ? startPosition : flatPosition;
                            var longitude = isHorisontal ? flatPosition : startPosition;
                            flatPosition += 40;
                            var cid = function cid() {
                                return "" + (N > crossId ? crossId : N) + (N > crossId ? N : crossId);
                            };
                            var createNoad = function createNoad() {
                                _this7.db.createRoadNode(longitude, latitude).then(function (roadNodeID) {
                                    if (getRandomBool()) {
                                        _this7.stations.push(roadNodeID);
                                    }
                                    _this7.db.addToStreet(streetID, roadNodeID);
                                    if (crosCounter) {
                                        var buildingLatitudeP = isHorisontal ? latitude + 15 : latitude;
                                        var buildingLongitudeP = isHorisontal ? longitude : longitude + 15;
                                        var buildingLatitudeM = isHorisontal ? latitude - 15 : latitude;
                                        var buildingLongitudeM = isHorisontal ? longitude : longitude - 15;

                                        var roadl = getRoadLenght(buildingLongitudeP, buildingLatitudeP, longitude, latitude);
                                        _this7.db.createNewBuilding("" + currentBuildingNumber, buildingLongitudeP, buildingLatitudeP).then(function (buildingID) {
                                            _this7.db.createRoad(roadNodeID, buildingID, roadl);
                                        });
                                        _this7.db.createNewBuilding("" + (currentBuildingNumber + 1), buildingLongitudeM, buildingLatitudeM).then(function (buildingID) {
                                            _this7.db.createRoad(roadNodeID, buildingID, roadl);
                                        });
                                    } else {
                                        _this7.cross[N][crossId] = {
                                            id: roadNodeID,
                                            longitude: longitude,
                                            latitude: latitude
                                        };
                                        crossId += 2;
                                    }
                                    crosCounter = crosCounter < 2 ? crosCounter + 1 : 0;
                                    if (lastRoadNodeID !== undefined) {
                                        _this7.db.createRoad(lastRoadNodeID, roadNodeID, getRoadLenght(lastRoadLongitude, lastRoadLatitude, longitude, latitude));
                                    }
                                    createBuilding(roadNodeID, longitude, latitude);
                                });
                            };
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
    }]);

    return Generator;
}();

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function getRoadLenght(gps_longitude, gps_latitude, gpe_longitude, gpe_latitude) {
    return Math.sqrt(Math.pow(gpe_latitude - gps_latitude, 2) + Math.pow(gpe_longitude - gps_longitude, 2));
}
function getRandomBool() {
    return getRandomInt(0, 2);
}