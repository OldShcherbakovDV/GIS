'use strict';

var CONFIG = {
    uri: 'bolt://localhost',
    user: 'neo4j',
    password: 'neo4j'
};
module.exports = CONFIG;

var a = {
    "roadNodes": [{
        "id": "0",
        "geo": {
            "longitude": 0,
            "latitude": 0
        }
    }, {
        "id": "1",
        "geo": {
            "longitude": 0,
            "latitude": 1
        }
    }],
    "roads": [{
        "from": "0",
        "to": "1"
    }, {
        "from": "1",
        "to": "0"
    }]
};