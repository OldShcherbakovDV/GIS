"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Station = exports.Station = function () {
    function Station(session) {
        _classCallCheck(this, Station);

        this._session = session;
    }

    _createClass(Station, [{
        key: "create",
        value: function create(rnID, name) {
            return this._session.run(Station.createExeption(), {
                rnID: rnID,
                name: name
            });
        }
    }, {
        key: "getByRoadNodeId",
        value: function getByRoadNodeId(rnID) {
            var req = "\n            MATCH (rn:RoadNode)--(s:Station)\n            WHERE ID(rn) = $rnID\n            RETURN ID(s)\n        ";
            return this._session.run(req, {
                rnID: rnID
            }).then(function (res) {
                return res.records.length ? res.records[0].get(res.records[0].keys[0]) : undefined;
            });
        }
    }], [{
        key: "createExeption",
        value: function createExeption() {
            return "\n            MATCH (rn:RoadNode)\n            WHERE ID(rn) = $rnID\n            CREATE (s:Station {name: $name})-[:Include]->(rn)\n            RETURN ID(s)\n        ";
        }
    }]);

    return Station;
}();