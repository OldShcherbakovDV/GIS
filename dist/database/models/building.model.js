"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Building = exports.Building = function () {
    function Building(session) {
        _classCallCheck(this, Building);

        this._session = session;
    }

    _createClass(Building, [{
        key: "create",
        value: function create(number, geoPointId) {
            return this._session.run(Building.createExeption(), {
                geoPointId: geoPointId,
                number: number
            });
        }
    }], [{
        key: "createExeption",
        value: function createExeption() {
            return "\n            MATCH (gp:GeoPoint)\n            WHERE ID(gp) = $geoPointId\n            CREATE (rn:Building {number: $number})-[:Include]->(gp)\n            RETURN ID(rn)\n        ";
        }
    }]);

    return Building;
}();