//These four imports are required for setup
let mongoose = require("mongoose");
let Station = require('../models/station');
let Observation = require('../models/observation');
let server = require('../app');

//These are the actual modules we use
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('Endpoint tests', () => {
    //###########################
    //These variables contain the ids of the existing station/observation
    //That way, you can use them in your tests (e.g., to get all observations for a station)
    //###########################

    let stationId = '';
    let observationId = '';

    //###########################
    //The beforeEach function makes sure that before each test, 
    //there is exactly one station and one observation (for the existing station).
    //The ids of both are stored in stationId and observationId
    //###########################
    beforeEach((done) => {
        let station = new Station({ description: "Reykjavik", lat: 64.1275, lon: 21.9028 });
        let observation = new Observation({ stationId: station._id, temp: 2.0, windSpeed: 30.5, windDir: "ne", hum: 20.5, prec: 0.0 });

        Station.deleteMany({}, (err) => {
            Observation.deleteMany({}, (err) => {
                station.save((err, stat) => {
                    observation.save((err, obs) => {
                        stationId = stat._id;
                        // console.log(stationId);
                        observationId = obs._id;
                        done();
                    });
                });
            });
        });
    });
    
    //###########################
    //Write your tests below here
    //###########################
    
    // 1. GET /api/v1/stations
    it("should make a GET request to stations /api/v1/stations", (done) => {
        chai.request('http://localhost:3000').get('/api/v1/stations').end((err, res) => {
            chai.expect(res).to.have.status(200);
            chai.expect(res).to.have.property('body');
            chai.expect(res.body).to.be.an('array');
            chai.expect(res.body.length).to.be.equal(1);
            chai.expect(res.body[0]).to.have.property('_id');
            chai.expect(res.body[0]).to.have.property('description');
            chai.expect(res.body[0]._id).to.be.equal(String(stationId));
            chai.expect(res.body[0].description).to.be.equal('Reykjavik');
            chai.expect(Object.keys(res.body[0]).length).to.be.equal(2);
            done();
        });
    });
    
    // 2. GET /api/v1/stations/:id
    it("should make a GET request to /api/v1/stations/:id", (done) => {
        chai.request('http://localhost:3000').get('/api/v1/stations/' + String(stationId)).end((err, res) => {
            chai.expect(res).to.have.status(200);
            chai.expect(res.content-type).to.be.json;
            chai.expect(res).to.have.property('body');
            chai.expect(res.body).to.be.an('object');
            chai.expect(res.body).to.have.property('_id');
            chai.expect(res.body).to.have.property('description');
            chai.expect(res.body).to.have.property('lat');
            chai.expect(res.body).to.have.property('lon');
            chai.expect(res.body).to.have.property('observations');
            chai.expect(res.body.observations).to.be.an('array');
            chai.expect(res.body.description).to.be.equal('Reykjavik');
            chai.expect(res.body.lat).to.be.equal(64.1275);
            chai.expect(res.body.lon).to.be.equal(21.9028);
            chai.expect(Object.keys(res.body).length).to.equal(5);
            done();
        });
    });
    
    // 3. POST /api/v1/stations
    it("should make a post request to /api/v1/stations", (done) => {
        chai.request('http://localhost:3000').post();
    });

    // 4. GET /api/v1/stations/:stationId/observations
    it("should make a GET request to GET /api/v1/stations/:stationId/observations", function() {
        chai.expect(1).to.equal(1);
    });
    
    // 5. GET /api/v1/stations/:stationId/observations/:obsId
    it("should make a POST request to /api/v1/stations/:stationId/observations/:obsId", function() {
        chai.expect(1).to.equal(1);
    });
    
    // 6. POST /api/v1/stations/:stationId/observations
    it("should make a POST request to /api/v1/stations/:stationId/observations", function() {
        chai.expect(1).to.equal(1);
    });
    
    // 7. DELETE /api/v1/stations/:stationId/observations/:obsId
    it("should make a DELETE request to /api/v1/stations/:stationId/observations/:obsId", function() {
        chai.expect(1).to.equal(1);
    });
});
