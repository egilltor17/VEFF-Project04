// These four imports are required for setup
let mongoose = require("mongoose");
let Station = require('../models/station');
let Observation = require('../models/observation');
let server = require('../app');
let util = require('../utility/objectIdChecker')
let sha256 = require('js-sha256');

// These are the actual modules we use
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('Endpoint tests', () => {
    // We disable console log in tests 6 B and C, and then restore it to suppress errors from observation.js
    let consoleLogStorrage = console.log 

    // ###########################
    // These variables contain the ids of the existing station/observation
    // That way, you can use them in your tests (e.g., to get all observations for a station)
    // ###########################

    let stationId = '';
    let observationId = '';

    // ###########################
    // The beforeEach function makes sure that before each test, 
    // there is exactly one station and one observation (for the existing station).
    // The ids of both are stored in stationId and observationId
    // ###########################
    beforeEach((done) => {
        let station = new Station({ description: "Reykjavik", lat: 64.1275, lon: 21.9028 });
        let observation = new Observation({ stationId: station._id, temp: 2.0, windSpeed: 30.5, windDir: "ne", hum: 20.5, prec: 0.0 });

        Station.deleteMany({}, (err) => {
            Observation.deleteMany({}, (err) => {
                station.save((err, stat) => {
                    observation.save((err, obs) => {
                        stationId = stat._id;
                        observationId = obs._id;
                        done();
                    });
                });
            });
        });
    });
    
    // ###########################
    // Write your tests below here
    // ###########################
    describe('Regular Endpoint Tests', () => {
        // 1. GET /api/v1/stations
        it("should make a GET request to stations /api/v1/stations", (done) => {
            chai.request('http://localhost:3000')
                .get('/api/v1/stations')
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('array');
                    chai.expect(res.body.length).to.be.equal(1);
                    chai.expect(util.isValidObjectID(String(stationId))).to.be.true;
                    chai.expect(res.body[0]).to.have.property('_id').equal(String(stationId));
                    chai.expect(res.body[0]).to.have.property('description').equal('Reykjavik');
                    chai.expect(Object.keys(res.body[0]).length).to.equal(2);
                    done();
                });
        });
        
        // 2. GET /api/v1/stations/:id
        it("should make a GET request to /api/v1/stations/:id", (done) => {
            chai.request('http://localhost:3000')
                .get('/api/v1/stations/' + String(stationId))
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('object');
                    chai.expect(util.isValidObjectID(String(stationId))).to.be.true;
                    chai.expect(res.body).to.have.property('_id').equal(String(stationId));
                    chai.expect(res.body).to.have.property('description').equal('Reykjavik');
                    chai.expect(res.body).to.have.property('lat').equal(64.1275);
                    chai.expect(res.body).to.have.property('lon').equal(21.9028);
                    chai.expect(res.body).to.have.property('observations').an('array');
                    chai.expect(Object.keys(res.body).length).to.equal(5);
                    done();
                });
            });
            
            // 3. POST /api/v1/stations
            it("should make a POST request to /api/v1/stations", (done) => {
                let newStation = { description : "Akureyri", lat : 65.6826, lon : 18.0907 }
                chai.request('http://localhost:3000')
                .post('/api/v1/stations/')
                .set("content-type", "application/json")
                .send(newStation)
                .end((err, res) => {
                    chai.expect(res).to.have.status(201);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('object');
                    chai.expect(res.body).to.have.property('_id');
                    chai.expect(util.isValidObjectID(String(res.body._id))).to.be.true;
                    chai.expect(res.body).to.have.property('description').equal("Akureyri");
                    chai.expect(res.body).to.have.property('lat').equal(65.6826);
                    chai.expect(res.body).to.have.property('lon').equal(18.0907);
                    chai.expect(Object.keys(res.body).length).to.equal(4)
                    done();
                });
        });

        // 4. GET /api/v1/stations/:stationId/observations
        it("should make a GET request to /api/v1/stations/:stationId/observations", (done) => {
            chai.request('http://localhost:3000')
                .get('/api/v1/stations/' + String(stationId) + '/observations')
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('array');
                    chai.expect(res.body.length).to.equal(1);
                    // We where not sure if we could skip the following
                    // tests since they are tested in 5.
                    chai.expect(res.body[0]).to.have.property('_id');
                    chai.expect(util.isValidObjectID(String(res.body[0]._id))).to.be.true;
                    chai.expect(res.body[0]).to.have.property('temp').equal(2);
                    chai.expect(res.body[0]).to.have.property('windSpeed').equal(30.5);
                    chai.expect(res.body[0]).to.have.property('windDir').equal("ne");
                    chai.expect(res.body[0]).to.have.property('hum').equal(20.5);
                    chai.expect(res.body[0]).to.have.property('prec').equal(0);
                    chai.expect(Object.keys(res.body[0]).length).to.equal(6);
                    done();
                });
        });
        
        // 5. GET /api/v1/stations/:stationId/observations/:obsId
        it("should make a GET request to /api/v1/stations/:stationId/observations/:obsId", (done) => {
            chai.request('http://localhost:3000')
                .get('/api/v1/stations/' + String(stationId) + '/observations/' + String(observationId))
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('object');
                    chai.expect(util.isValidObjectID(String(stationId))).to.be.true;
                    chai.expect(util.isValidObjectID(String(observationId))).to.be.true;
                    chai.expect(res.body).to.have.property('_id').equal(String(observationId));
                    chai.expect(res.body).to.have.property('temp').equal(2);
                    chai.expect(res.body).to.have.property('windSpeed').equal(30.5);
                    chai.expect(res.body).to.have.property('windDir').equal("ne");
                    chai.expect(res.body).to.have.property('hum').equal(20.5);
                    chai.expect(res.body).to.have.property('prec').equal(0);
                    chai.expect(Object.keys(res.body).length).to.equal(6);
                    done();
                }); 
        });
        
        // 6.A POST /api/v1/stations/:stationId/observations
        it("should make a POST request to /api/v1/stations/:stationId/observations", (done) => {
            let newObservation = { temp: 5, windSpeed: 23, windDir: "s", hum: 10.1, prec: 42 }
            chai.request('http://localhost:3000')
                .post('/api/v1/stations/' + String(stationId) + '/observations/')
                .set('Content-Type','application/json')
                .send(newObservation)
                .end((err, res) =>{
                    chai.expect(res).to.have.status(201);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('object');
                    chai.expect(res.body).to.have.property('_id');
                    chai.expect(util.isValidObjectID(String(res.body._id))).to.be.true;
                    chai.expect(res.body).to.have.property('temp').equal(5);
                    chai.expect(res.body).to.have.property('windSpeed').equal(23);
                    chai.expect(res.body).to.have.property('windDir').equal("s");
                    chai.expect(res.body).to.have.property('hum').equal(10.1);
                    chai.expect(res.body).to.have.property('prec').equal(42);
                    chai.expect(Object.keys(res.body).length).to.equal(6);
                    done();
                });
        });

        // 6.B POST /api/v1/stations/:stationId/observations
        it("should make a Bad POST request to /api/v1/stations/:stationId/observations", (done) => {
            console.log = function() {}                  // suppress loged errors  
            let newObservation = { temp: 5, windSpeed: 23, /* windDir missing */ hum: 34, prec: 42 }
            chai.request('http://localhost:3000')
                .post('/api/v1/stations/' + String(stationId) + '/observations')
                .set('Content-Type','application/json')
                .send(newObservation)
                .end((err, res)=> {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('object');
                    chai.expect(res.body).to.have.property('message').equal("Bad request.");
                    chai.expect(Object.keys(res.body).length).to.equal(1);
                    console.log = consoleLogStorrage    // reenable console.log
                    done();
                });
            });
            
        // 6.C POST /api/v1/stations/:stationId/observations
        it("should make a Bad Post request to /api/v1/stations/:stationId/observations with invalid humidity", (done)=> {
            console.log = function() {}                 // suppress loged errors  
            let newObservation = { temp: 5, windSpeed: 23, windDir: "s", hum: 100.1, prec: 42 }
            chai.request('http://localhost:3000')
                .post('/api/v1/stations/' + String(stationId) + '/observations')
                .set('Content-Type','application/json')
                .send(newObservation)
                .end((err, res)=> {
                    chai.expect(res).to.have.status(400);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('object');;
                    chai.expect(res.body).to.have.property('message').equal("Bad request.");
                    chai.expect(Object.keys(res.body).length).to.equal(1);
                    console.log = consoleLogStorrage    // reenable console.log
                    done();
                });
        });
        
        // 7. DELETE /api/v1/stations/:stationId/observations/:obsId
        it("should make a DELETE request to /api/v1/stations/:stationId/observations/:obsId", (done) => {
            chai.request('http://localhost:3000')
                .delete(`/api/v1/stations/${stationId}/observations/${observationId}`)
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('object');
                    chai.expect(util.isValidObjectID(String(stationId))).to.be.true;
                    chai.expect(util.isValidObjectID(String(observationId))).to.be.true;
                    chai.expect(res.body).to.have.property('_id').equal(String(observationId));
                    chai.expect(res.body).to.have.property('temp').equal(2);
                    chai.expect(res.body).to.have.property('windSpeed').equal(30.5);
                    chai.expect(res.body).to.have.property('windDir').equal("ne");
                    chai.expect(res.body).to.have.property('hum').equal(20.5);
                    chai.expect(res.body).to.have.property('prec').equal(0);     
                    chai.expect(Object.keys(res.body).length).to.be.equal(6);
                    done();
                });
        });

        // 10. Invalid verb to /api/v1/stations
        it("should return 405 if invalid verb sent to /api/v1/stations", (done) => {
            chai.request('http://localhost:3000')
                .put('/api/v1/stations')
                .end((err, res) => {
                    chai.expect(res).to.have.status(405);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('object');
                    chai.expect(res.body).to.have.property('message').equal("Operation not supported!");
                    chai.expect(Object.keys(res.body).length).to.equal(1);
                    done();
                });
        });        
    });
    
    describe('Advanced Endpoint Tests', () => {
        // 8.A DELETE /api/v1/stations/:id
        it("should deny a DELETE request to /api/v1/stations/:id without authentication", (done) => {
            // No authentication.
            chai.request('http://localhost:3000')
                .delete('/api/v1/stations/' + stationId)
                .end((err, res) => {
                    chai.expect(res).to.have.status(401);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('object');
                    chai.expect(res.body).to.have.property('message').equal("Unauthorised");
                    chai.expect(Object.keys(res.body).length).to.equal(1);
                    done();
                });
            });
            
            // 8.B DELETE /api/v1/stations/:id
            it("should make a DELETE request to /api/v1/stations/:id with authentication", (done) => {
                // With correct authentication.
                chai.request('http://localhost:3000')
                .delete('/api/v1/stations/' + stationId)
                .set('authorization', sha256.hmac('mysecret', 'DELETE /api/v1/stations/' + stationId))
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res).to.be.json;
                    chai.expect(util.isValidObjectID(String(stationId))).to.be.true;
                    chai.expect(res.body).to.have.property('_id').equal(String(stationId));
                    chai.expect(res.body).to.have.property('description').equal('Reykjavik');
                    chai.expect(res.body).to.have.property('lat').equal(64.1275);
                    chai.expect(res.body).to.have.property('lon').equal(21.9028);
                    chai.expect(res.body).to.have.property('observations').an('array');
                    chai.expect(Object.keys(res.body).length).to.equal(5);
                    chai.expect(res.body.observations.length).to.equal(1);
                    chai.expect(res.body.observations[0]).to.have.property('_id');
                    chai.expect(util.isValidObjectID(String(res.body.observations[0]._id))).to.be.true;
                    chai.expect(res.body.observations[0]).to.have.property('temp').equal(2);
                    chai.expect(res.body.observations[0]).to.have.property('windSpeed').equal(30.5);
                    chai.expect(res.body.observations[0]).to.have.property('windDir').equal("ne");
                    chai.expect(res.body.observations[0]).to.have.property('hum').equal(20.5);
                    chai.expect(res.body.observations[0]).to.have.property('prec').equal(0);
                    chai.expect(Object.keys(res.body.observations[0]).length).to.equal(6);     
                    done();
                });
        });

        // 9. Injection attact! ?description={ $ne: "Akureyri" }
        it('should return "Reykjavik" with GET /api/v1/stations?description={ $ne: "Akureyri" }', (done) => {
            chai.request('http://localhost:3000')
                .get('/api/v1/stations')
                .query({ description: { $ne: "Akureyri" } })
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
                    chai.expect(res).to.be.json;
                    chai.expect(res).to.have.property('body').an('array');
                    chai.expect(res.body.length).to.equal(1);
                    chai.expect(res.body[0]).to.have.property('_id');
                    chai.expect(util.isValidObjectID(String(res.body[0]._id))).to.be.true;
                    chai.expect(res.body[0]).to.have.property('description').equal('Reykjavik');
                    chai.expect(Object.keys(res.body[0]).length).to.equal(2);
                    done();
                });
        }); 
    });
});
