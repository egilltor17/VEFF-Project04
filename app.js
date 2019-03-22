var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sha256 = require('js-sha256');

// Variables
var mongoURI = 'mongodb://localhost:27017/weather';
var port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true }, function (err) {
    if (err) {
        console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
        console.error(err.stack);
        process.exit(1);
    }
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
});

// Create Express app
var app = express();
// Parse requests of content-type 'application/json'
app.use(bodyParser.json());

//Simple HMAC Middleware
app.delete("/api/v1/stations/:stationId", function (req, res, next) {
    let hmac = sha256.hmac('mysecret', req.method.toUpperCase() + " " + req.path.toLowerCase());
    if (req.header('authorization') !== undefined) {
        if (hmac === req.header('authorization')) {
            next();
        } else {
            return res.status(401).json({"message": "Unauthorised"});
        }
    } else {
        return res.status(401).json({"message": "Unauthorised"});
    }
});

// Import routes
app.use(require('./controllers/index'));

// Error handler
var env = app.get('env');
app.use(function (err, req, res, next) {
    console.error(err.stack);
    var err_res = {
        "message": err.message,
        "error": {}
    };
    if (env === 'development') {
        err_res["error"] = err;
    }
    res.status(err.status || 500);
    res.json(err_res);
});

app.listen(port, function (err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/v1`);
});

module.exports = app;
