var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var stationSchema = new Schema({
    description: { type: String, required: [true, "Stations require a description!"] },
    lat: { type: Number, min: -90.0, max: 90.0, required: [true, "Stations require a lat!"] },
    lon: { type: Number, min: -180.0, max: 180.0, required: [true, "Stations require a lon!"] }
});

stationSchema.methods.getPublic = function () {
    var returnObject = {
        description: this.description,
        lat: this.lat,
        lon: this.lon,
        _id: this._id
    };
    return returnObject;
};

module.exports = mongoose.model('stations', stationSchema);