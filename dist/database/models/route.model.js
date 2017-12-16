"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Route = exports.Route = function () {
    function Route(session) {
        _classCallCheck(this, Route);

        this._session = session;
    }

    _createClass(Route, [{
        key: "create",
        value: function create(name) {
            return this._session.run(Route.createExeption(), {
                name: name
            });
        }
    }, {
        key: "addNode",
        value: function addNode(routeId, nodeId) {
            var req = "\n            MATCH (r:Route), (n)\n            WHERE ID(r) = $rID AND ID(n) = $nID\n            CREATE (r)-[:Include]->(n)\n        ";
            return this._session.run(req, {
                rID: routeId,
                nID: nodeId
            });
        }
    }], [{
        key: "createExeption",
        value: function createExeption() {
            return "\n            CREATE (s:Route {name: $name})\n            RETURN ID(s)\n        ";
        }
    }]);

    return Route;
}();