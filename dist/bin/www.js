#!/usr/bin/env node
'use strict';

var _index = require('../database/index');

Array.prototype.regexpIndexOf = function (regexp) {
    for (var i in this) {
        if (this[i].toString().match(regexp)) {
            return i;
        }
    }
    return -1;
};
if (process.argv.indexOf('-g')) {
    var db = new _index.DataBase();
    var streetCountI = process.argv.regexpIndexOf('-sc=\d+');
    var maxBuildingCountI = process.argv.regexpIndexOf('-mbc=\d+');
    var streetCount = streetCountI == -1 ? 40 : process.argv[streetCountI].substring(4);
    var maxBuildingCount = maxBuildingCountI == -1 ? 40 : process.argv[maxBuildingCountI].substring(5);

    console.log('\u0413\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u043A\u0430\u0440\u0442\u0430 \u0438\u0437 ' + streetCount + ' \u0441 \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u043C \u043A\u043E\u043B-\u0432\u043E\u043C \u043F\u043E\u0441\u0442\u0440\u043E\u0435\u043A \u043D\u0430 \u0443\u043B\u0438\u0446\u0435 ' + maxBuildingCount);
} else {

    /**
     * Normalize a port into a number, string, or false.
     */

    var normalizePort = function normalizePort(val) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    };

    /**
     * Event listener for HTTP server "error" event.
     */

    var onError = function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    };

    /**
     * Event listener for HTTP server "listening" event.
     */

    var onListening = function onListening() {
        var addr = server.address();
        var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        debug('Listening on ' + bind);
    };

    /**
     * Module dependencies.
     */

    var app = require('../app');
    var debug = require('debug')('gis:server');
    var http = require('http');

    /**
     * Get port from environment and store in Express.
     */

    var port = normalizePort(process.env.PORT || '3000');
    app.set('port', port);

    /**
     * Create HTTP server.
     */

    var server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
}