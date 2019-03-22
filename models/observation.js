var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var station = require('./station');

var observationSchema = new Schema({
    temp: { type: Number, required: [true, "Observations require a temp!"] },
    windSpeed: { type: Number, required: [true, "Observations require a windSpeed!"] },
    windDir: { type: String, required: [true, "Observations require a windDir!"] },
    hum: { type: Number, min: 0.0, max: 100.0, required: [true, "Observations require a hum!"] },
    prec: { type: Number, min: 0.0, required: [true, "Observations require a prec!"] },
    stationId: { type: Schema.Types.ObjectId, ref: 'stations', required: [true, "Observations require a stationId!"]}
});

observationSchema.methods.getPublic = function () {
    var returnObject = {
        temp: this.temp,
        windSpeed: this.windSpeed,
        windDir: this.windDir,
        hum: this.hum,
        prec: this.prec,
        _id: this._id
    };
    return returnObject;
};

module.exports = mongoose.model('observations', observationSchema);
