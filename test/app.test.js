//These four imports are required for setup
let mongoose = require("mongoose");
let Station = require('../models/station');
let Observation = require('../models/observation');
let server = require('../app');
var sha256 = require('js-sha256');

//These are the actual modules we use
let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('Endpoint tests', () => {
    var consoleStorage = console.log
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
        chai.request('http://localhost:3000')
            .get('/api/v1/stations')
            .end((err, res) => {
                chai.expect(res).to.have.status(200);
                chai.expect(res).to.have.property('body');
                chai.expect(res.body).to.be.an('array');
                chai.expect(res.body.length).to.be.equal(1);
                chai.expect(res.body[0]).to.have.property('_id').equal(String(stationId));
                chai.expect(res.body[0]).to.have.property('description').equal('Reykjavik');
                chai.expect(Object.keys(res.body[0]).length).to.be.equal(2);
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
                chai.expect(res).to.have.property('body');
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
        let newStation = {
            description : "Akureyri",
            lat : 65.6826,
            lon : 18.0907
        }
        chai.request('http://localhost:3000')
            .post('/api/v1/stations/')
            .set("content-type", "application/json")
            .send(newStation)
            .end((err, res) => {
                chai.expect(res).to.have.status(201);
                chai.expect(res).to.be.json;
                chai.expect(res.body).to.have.property('_id');
                chai.expect(res.body).to.have.property('description');
                chai.expect(res.body).to.have.property('lat');
                chai.expect(res.body).to.have.property('lon');
                chai.expect(res.body.description).to.be.equal("Akureyri");
                chai.expect(res.body.lat).to.be.equal(65.6826);
                chai.expect(res.body.lon).to.be.equal(18.0907);
                chai.expect(Object.keys(res.body).length).to.be.equal(4)
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
                chai.expect(res).to.have.property('body');
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
    
    // 6. POST /api/v1/stations/:stationId/observations
    // part A
    it("should make a POST request to /api/v1/stations/:stationId/observations", (done) => {
        let obs = {temp: 5, windSpeed: 23, hum: 10.1, prec: 42, windDir: "s"}
        chai.request('http://localhost:3000')
        .post('/api/v1/stations/' + String(stationId) + '/observations/')
        .set('Content-Type','application/json')
        .send(obs)
        .end((err, res) =>{
            chai.expect(res).to.have.status(201);
            chai.expect(res).to.have.property('body');
            chai.expect(res.body).to.be.a('object');
            done();
        })
    })
    // part B
    it("should make a Bad POST request to /api/v1/stations/:stationId/observations", (done) => {
        console.log = function(){}
        let obs = {temp: 5, windSpeed: 23, hum: 34, prec: 42}
        chai.request('http://localhost:3000')
        .post('/api/v1/stations/' + String(stationId) + '/observations')
        .set('Content-Type','application/json')
        .send(obs)
        .end((err, res)=> {
            chai.expect(res).to.have.status(400);
            chai.expect(res).to.have.property('body');
            chai.expect(res.body).to.be.a('object');
            chai.expect(res.body).to.deep.equal({ "message": "Bad request." })
            done();
        });
    });

    // part C
    it("should make a Post request to /api/v1/stations/:stationId/observations with invalid humidity", (done)=> {
        let obs = {temp: 5, windSpeed: 23, hum: 100.1, prec: 42, windDir: "s"}
        chai.request('http://localhost:3000')
        .post('/api/v1/stations/' + String(stationId) + '/observations')
        .set('Content-Type','application/json')
        .send(obs)
        .end((err, res)=> {
            chai.expect(res).to.have.status(400);
        console.log = consoleStorage 
            done();
        })
    })

    // 7. DELETE /api/v1/stations/:stationId/observations/:obsId
    it("should make a DELETE request to /api/v1/stations/:stationId/observations/:obsId", (done) => {
        chai.request('http://localhost:3000').delete(`/api/v1/stations/${stationId}/observations/${observationId}`).end((err, res) => {
            chai.expect(res).to.have.status(200);
            chai.expect(res).to.be.json;
            chai.expect(res.body).to.be.an('object');
            chai.expect(res.body).to.have.property('temp');
            chai.expect(res.body).to.have.property('hum');
            chai.expect(res.body).to.have.property('prec');
            chai.expect(res.body).to.have.property('windSpeed');
            chai.expect(res.body).to.have.property('windDir');       
            chai.expect(res.body).to.have.property('_id');     
            chai.expect(Object.keys(res.body).length).to.be.equal(6);
            done();
        })
        
    });

    // 8.A DELETE /api/v1/stations/:id
    it("should denie a DELETE request to /api/v1/stations/:id", (done) => {
        // No authentication.
        chai.request('http://localhost:3000')
            .delete('/api/v1/stations/' + stationId)
            .end((err, res) => {
                chai.expect(res).to.have.status(401);
                chai.expect(res).to.be.json;
                chai.expect(res).to.have.property('body');
                chai.expect(res.body).to.have.property('message').equal("Unauthorised");
                done();
        });
    });
    
    // 8.B DELETE /api/v1/stations/:id
    it("should make a DELETE request to /api/v1/stations/:id", (done) => {
        chai.request('http://localhost:3000')
                .delete('/api/v1/stations/' + stationId)
                .set('authorization', sha256.hmac('mysecret', 'DELETE /api/v1/stations/' + stationId))
                .end((err, res) => {
                    chai.expect(res).to.have.status(200);
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
                chai.expect(res.body[0]).to.have.property('description').equal('Reykjavik');
                chai.expect(Object.keys(res.body[0]).length).to.equal(2);
                done();
        });
    }); 

    // 10. invalid verb to /api/v1/stations
    it("should return 405 if invalid verb sent to /api/v1/stations", (done) => {
        chai.request('http://localhost:3000').put('/api/v1/stations')
            .end((err, res) => {
                chai.expect(res).to.have.status(405);
                done();
        });
    });
});
