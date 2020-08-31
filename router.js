const express = require('express');
const router = express.Router();

router.get('/', function(request, response) {
    response.send('server is running')
});

module.exports = router;