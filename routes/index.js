var express = require('express');
var router = express.Router();
const { models } = require('../sequelize');

/* GET home page. */
router.get('/', async (req, res, next) => {


  res.render('index', { title: 'BNDS' });
});

router.get('/test', async (req,res) => {
  const operators = await models.operator.findAll({raw:true});
  console.log(operators.every(operator => operator instanceof models.operator))
  console.log(operators);

  res.status(200).json("ok")
})


module.exports = router;
