var express = require('express');
var router = express.Router()

//Station routes
router.use('/api/v1/stations', require('./stations'));

router.route('/*').all(function (req, res) {
    res.status(405).json({"message": "Operation not supported!"});
});

module.exports = router
