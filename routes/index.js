var express = require('express');
var router = express.Router();
const { models } = require('../sequelize');
const { Op } = require("sequelize");
require('dotenv').config();

/* GET home page. */
router.get('/', async (req, res, next) => {
  operators=await models.operator.findAll({raw: true, attributes: ['name','id']})
  res.render('index', { title: 'BNDS', operators: operators, version: process.env.VERSION});
});

router.get('/acerca-de', async (req, res, next) => {
  res.render('acerca-de', { title: 'BNDS', version: process.env.VERSION});
});

router.post('/resultado', async (req, res) => {
  //Obtenemos todas las operadoras
  operators=await models.operator.findAll({raw: true, attributes: ['name','id']})
  //Obtenemos la operadora
  operator = await models.operator.findOne({
    where: {
      id: req.body.operator
    },
    attributes: ['id', 'name', 'urlWeb', 'urlLogo'],
  });

  //Obtenemos todas las tecnologías
  technologies = await models.technology.findAll({attributes:['id', 'name'], raw:true});
  techList = [];
  var techiter = 0;
  for (technology of technologies) {
    techList[technology.id]
  }

  //Obtenemos compatibilidades de operadora y tecnología
  operator_technologies = await models.operator_technology.findAll({where: {operatorId: operator.id}, raw:true});
  for (operator_technology of operator_technologies) {
    technologies.find(x => x.id === operator_technology.technologyId).operatorCompat = operator_technology.compatible
  }
  technologies.forEach((item, i) => {
    if (item.operatorCompat === undefined) {
      item.operatorCompat = 2
    }
  });

  //Obtenemos todas las generaciones de frecuencias y sus respectivas frecuencias
  generations = await models.generation.findAll();
  genList = []
  var genIter = 0;
  for (generation of generations) {
    var freqIter = 0;
    genList[genIter] = {};
    genList[genIter].name = generation.name
    genList[genIter].frequencies = [];
    frequencies = await generation.getFrequencies();
    for (var frequency of frequencies) {
      genList[genIter].frequencies[freqIter] = {};
      genList[genIter].frequencies[freqIter].name = frequency.name;
      genList[genIter].frequencies[freqIter].id= frequency.id;
      freqIter++
    }
    genIter++;
  }

  //Obtenemos compatibilidad de operadora y frecuencias
  operator_frequencies = await models.operator_frequency.findAll({where: {operatorId: operator.id}, raw:true});

  function searchFrequencyCompat(frequencyId, op_freq){
    var frequencylist = [];
    for (var operator_frequency of op_freq) {
      if (operator_frequency.frequencyId == frequencyId) {
        frequencylist.push(operator_frequency);
      }
    }
    return frequencylist;
  }
  for (frequency_generation of genList) {
    for (frequency of frequency_generation.frequencies) {
      providers = searchFrequencyCompat(frequency.id, operator_frequencies)
      frequency.roamingProviders = [];
      for (provider of providers) {
        frequency.operatorCompat = provider.compatible
        if (provider.roaming) {
          frequency.roaming = 1
          providerOperator = await models.operator.findOne({
            where: {id: provider.providerId},
            attributes: ['name'],
            raw:true
          })
          frequency.roamingProviders.push(providerOperator);
        }
        else {
          frequency.roaming = 0
        }

      }
      if(frequency.operatorCompat === undefined){
        frequency.operatorCompat = 2
      }
      if(frequency.roaming === undefined){
        frequency.roaming = 0
      }
    }
  }

  //Obtenemos el smartphone
  smartphone = await models.smartphone.findOne({
    where: {
      fullName: {[Op.substring]: req.body.smartphone}
    },
    raw:true
  });

  //Obtenemos compatibilidades de operadora y tecnología
  smartphone_technologies = await models.smartphone_technology.findAll({where: {smartphoneId: operator.id}, raw:true});
  for (smartphone_technology of smartphone_technologies) {
    technologies.find(x => x.id === smartphone_technology.technologyId).smartphoneCompat = smartphone_technology.compatible
  }
  technologies.forEach((item, i) => {
    if (item.smartphoneCompat === undefined) {
      item.smartphoneCompat = 2
    }
  });

  //Obtenemos comaptibilidad de smartphone y frecuencia
  smartphone_frequencies = await models.smartphone_frequency.findAll({where: {smartphoneId: smartphone.id}, attributes: ['frequencyId', 'compatible'], raw:true});
  for (frequency_generation of genList){
    for(frequency of frequency_generation.frequencies){
      smartphone_frequencies.forEach((item, i) => {
        if (item.frequencyId == frequency.id) {
          frequency.smartphoneCompat = item.compatible;
        }
      });
      if (frequency.smartphoneCompat === undefined) {
        frequency.smartphoneCompat = 2
      }
    }
  }
  res.render('result', {
    title: 'BNDS',
    operators: operators,
    operator: operator,
    smartphone: smartphone,
    generations: genList,
    technologies: technologies,
    version: process.env.VERSION
  });

})

module.exports = router;
