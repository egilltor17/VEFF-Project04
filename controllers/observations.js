var express = require('express');
var router = express.Router({mergeParams: true});
var Observation = require('../models/observation');
var Station = require('../models/station');
var mongoose = require('mongoose');
var utility = require('../utility/objectIdChecker');

// Return a list of all observations
router.get('/', function (req, res, next) {
    if (!utility.isValidObjectID(req.params.stationId)) {
        return res.status(404).json({"message": "Station not found!"});
    }

    Observation.find({stationId: req.params.stationId}, '-__v -stationId', function(err, obs) {
        if (err) { return res.status(500).json({ "message": "Internal server error on getting all observations." }); }
        res.status(200).json(obs);
    });
});

// Get a specific observation
router.get('/:obsId', function (req, res, next) {
    if (!utility.isValidObjectID(req.params.stationId)) {
        return res.status(404).json({"message": "Station not found!"});
    }

    if (!utility.isValidObjectID(req.params.obsId)) {
        return res.status(404).json({"message": "Observation not found!"});
    }

    Observation.findOne({stationId: req.params.stationId, _id: req.params.obsId}, '-__v -stationId', function(err, obs) {
        if (err) { return res.status(500).json({ "message": "Internal server error on getting an observation." }); }

        if (obs === null) {
            return res.status(404).json({"message":"Observation not found."});
        }
        res.status(200).json(obs);
    });
});

// Create a new observation
router.post('/', function (req, res, next) {
    if (!utility.isValidObjectID(req.params.stationId)) {
        return res.status(404).json({"message": "Station not found!"});
    }

    Station.findOne({_id: req.params.stationId}, '-__v', function (err, station) {
        if (err) { return next(err); }
        if (station == null) {
            return res.status(404).json({ "error": "Station not found" });
        }

        let myObsObj = req.body;
        myObsObj.stationId = req.params.stationId;
        let obs = new Observation(myObsObj);
    
        obs.save(function(err) {
            if (err) { 
                console.log(err);
                return res.status(400).json({ "message": "Bad request." }); 
            }
            res.status(201).json(obs.getPublic());
        });
    });
    
});

// Delete a specific observation
router.delete('/:obsId', function (req, res, next) {
    if (!utility.isValidObjectID(req.params.stationId)) {
        return res.status(404).json({"message": "Station not found!"});
    }

    if (!utility.isValidObjectID(req.params.obsId)) {
        return res.status(404).json({"message": "Observation not found!"});
    }

    Observation.findOneAndDelete({stationId: req.params.stationId, _id: req.params.obsId}, function(err, obs) {
        if (err) { return res.status(500).json({ "message": "Internal server error on getting an observation." }); }
        if (obs === null) {
            return res.status(404).json({"message":"Observation not found."});
        }

        let obsObj = obs._doc;
        delete obsObj.__v;
        delete obsObj.stationId;

        res.status(200).json(obsObj);
    });
});

module.exports = router