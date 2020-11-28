var express = require('express');
var router = express.Router();
var smartphone = require('../models').smartphone;
var operator = require('../models').operator;

/* GET home page. */
router.get('/', async (req, res, next) => {
  await operator.findAll()
  res.render('index', { title: 'BNDS' });
});

module.exports = router;
