const express = require('express');
const router = express.Router();

// @routes    GET api/users/test
// @des       test users router
// @access    Public

router.get('/test', (req, res) => res.json ({msg: 'User Works'}));


module.exports = router;