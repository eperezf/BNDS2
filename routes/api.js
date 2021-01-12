var express = require('express');
var router = express.Router();
const { models } = require('../sequelize');
const { Op } = require("sequelize");

router.get('/', async (req, res, next) => {
  res.status(200).json({status: 'ok', version: '1'});
});

router.get('/autocomplete/:name', async (req, res, next) => {
  suggestions = await models.smartphone.findAll({
    raw: true,
    where: {
      fullName: {[Op.substring]: req.params.name},
      visible: 1
    },
    attributes: ['fullName'],
    limit: 5
  })
  res.status(200).json({suggestions});
});

module.exports = router;
