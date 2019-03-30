var express = require('express');
var router = express.Router();
var Station = require('../models/station');
var Observation = require('../models/observation');
var mongoose = require('mongoose');
var utility = require('../utility/objectIdChecker');

//Sub-routes for observations should be forwarded
router.use('/:stationId/observations', require('./observations'));

// Return a list of all stations
router.get('/', function (req, res, next) {
    if (req.query.description !== undefined) {
        Station.find({description: req.query.description}, 'description _id', function (err, stations) {
            if (err) { return next(err); }
            res.status(200).json(stations);
        });
    } else {
        Station.find({}, 'description _id', function (err, stations) {
            if (err) { return next(err); }
            res.status(200).json(stations);
        });
    }
});

// Return a specific station
router.get('/:id', function (req, res, next) {
    if (!utility.isValidObjectID(req.params.id)) {
        return res.status(404).json({ "error": "Station not found!" });
    }

    Station.findById(req.params.id, '-__v', function (err, station) {
        if (err) { return next(err); }
        if (station == null) {
            return res.status(404).json({ "error": "Station not found" });
        }

        var stationObj = station._doc;
        stationObj.observations = [];
        Observation.find({ stationId: req.params.id }, '_id', (err, obs) => {
            if (err) { return res.status(500).json({ "message": "Internal server error on getting observations to a station." }); }

            for (let i = 0; i < obs.length; i++) {
                stationObj.observations.push(obs[i]._id);
            }

            res.status(200).json(stationObj);
        });
    });
});

// Create a new station
router.post('/', function (req, res, next) {
    var station = new Station(req.body);
    station.save(function (err) {
        if (err && err.name === 'ValidationError' && err instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({ "error": "Incorrect format of request body" });
        } else {
            res.status(201).json(station.getPublic());
        }
    });
});

//Delete a specific station
router.delete('/:id', function (req, res, next) {
    if (!utility.isValidObjectID(req.params.id)) {
        return res.status(404).json({ "error": "Station not found!" });
    }

    Station.findOneAndDelete({ _id: req.params.id }, function (err, station) {
        if (err) { return res.status(404).json({ "error": "Station not found!" }); }
        if (station == null) {
            return res.status(404).json({ "error": "Station not found!" });
        }

        var stationObj = station._doc;
        delete stationObj.__v;
        stationObj.observations = [];
        Observation.find({ stationId: req.params.id }, '-__v -stationId', (err, obs) => {
            if (err) { return res.status(500).json({ "message": "Internal server error on getting observations to a station." }); }

            for (let i = 0; i < obs.length; i++) {
                stationObj.observations.push(obs[i]);
            }

            Observation.deleteMany({ stationId: req.params.id }, (err) => {
                if (err) { return res.status(500).json({ "message": "Internal server error on delete stations." }); }
                res.status(200).json(stationObj);
            });
        });
    });
});

module.exports = router