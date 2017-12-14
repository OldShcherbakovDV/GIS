var express = require('express');
var router = express.Router();
import { DataBase, Generator } from '../database';

const db = new DataBase;
router.get('/street/create', function(req, res, next) {
    let ans = {
        error: 'invalid input params'
    }
    if (req.params.name != undefined &&
        req.params.gps_longitude != undefined &&
        req.params.gps_latitude != undefined &&
        req.params.gpe_longitude != undefined &&
        req.params.gpe_latitude != undefined) {
        db.createNewStreet(req.params.name, req.params.gps_longitude, req.params.gps_latitude,
                            req.params.gpe_longitude, req.params.gpe_latitude)
            .then(id => {
                res.send(JSON.stringify({
                    id: id.toString()
                }));
            })

    } else {
        res.send(JSON.stringify(ans));
    }
});

router.get('/get-all', function(req, res, next) {
    db.getAll().then(result => {
        res.send(JSON.stringify(result));
    });
});
router.get('/path', function(req, res, next) {

    if (req.query.s1 != undefined &&
        req.query.b1 != undefined &&
        req.query.s2 != undefined &&
        req.query.b2 != undefined) {

        db.getPath(req.query.s1, req.query.b1, req.query.s2, req.query.b2).then(result => {
            console.log('llll')
            res.send(JSON.stringify(result));
        });
    } else {
        res.send(JSON.stringify([]));
    }
});
router.get('/search', function(req, res, next) {
    if (req.query.street != undefined &&
        req.query.building != undefined) {
        db.getAll(req.query.street, req.query.building).then(result => {
            res.send(JSON.stringify(result));
        });
    } else if (req.query.street != undefined) {
        db.getAll(req.query.street).then(result => {
            res.send(JSON.stringify(result));
        });
    }

});

router.get('/generator', function(req, res, next) {
    if (req.query.sc != undefined &&
        req.query.mbc != undefined) {
        const g = new Generator(db, req.query.sc, req.query.mbc, () => {
            res.send('Created new map)');
        });
    } else {
        res.send('Invalid input');
    };
});

module.exports = router;
