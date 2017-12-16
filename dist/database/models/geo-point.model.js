"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GeoPoint = exports.GeoPoint = function () {
    function GeoPoint(session) {
        _classCallCheck(this, GeoPoint);

        this._session = session;
    }

    _createClass(GeoPoint, [{
        key: "create",
        value: function create(longitude, latitude) {
            return this._session.run(GeoPoint.createExeption(), {
                longitude: longitude,
                latitude: latitude
            });
        }
    }], [{
        key: "createExeption",
        value: function createExeption() {
            return "CREATE (gp:GeoPoint {longitude: $longitude, latitude: $latitude}) RETURN ID(gp)";
        }
    }]);

    return GeoPoint;
}();