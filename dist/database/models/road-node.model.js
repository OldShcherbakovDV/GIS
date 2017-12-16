"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RoadNode = exports.RoadNode = function () {
    function RoadNode(session) {
        _classCallCheck(this, RoadNode);

        this._session = session;
    }

    _createClass(RoadNode, [{
        key: "create",
        value: function create(geoPointId) {
            return this._session.run(RoadNode.createExeption(), {
                geoPointId: geoPointId
            });
        }
    }], [{
        key: "createExeption",
        value: function createExeption() {
            return "\n            MATCH (gp:GeoPoint)\n            WHERE ID(gp) = $geoPointId\n            CREATE (rn:RoadNode)-[:Include]->(gp)\n            RETURN ID(rn)\n        ";
        }
    }]);

    return RoadNode;
}();