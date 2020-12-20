var express = require('express');
var router = express.Router();
const { models } = require('../sequelize');
const { Op } = require("sequelize");
const axios = require('axios');
require('dotenv').config();

/* GET home page. */
router.get('/', async (req, res, next) => {
  operators=await models.operator.findAll({raw: true, attributes: ['name','id']})
  var message
  if (req.cookies.message) {
    message = req.cookies.message
  }
  res.render('index', { title: 'BNDS', operators: operators, version: process.env.VERSION, message:message});
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

  //Obtenemos el smartphone
  smartphone = await models.smartphone.findOne({
    where: {
      fullName: {[Op.substring]: req.body.smartphone}
    },
    raw:true
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

  //Obtenemos todas las tecnologías
  technologies = await models.technology.findAll({attributes:['id', 'name'], raw:true});
  techList = [];
  var techiter = 0;
  for (technology of technologies) {
    techList[techiter]
  }

  //Obtenemos compatibilidades de operadora y tecnología
  operator_technologies = await models.operator_technology.findAll({where: {operatorId: operator.id}, raw:true});
  for (operator_technology of operator_technologies) {
    technologies.forEach((item, i) => {
      if (operator_technology.technologyId == item.id) {
        technologies[i].operatorCompat = operator_technology.compatible
      }
    });
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

    }
  }

  //Obtenemos compatibilidades de smartphone y tecnología
  smartphone_technologies = await models.smartphone_technology.findAll({where: {smartphoneId: smartphone.id}, raw:true});
  for (smartphone_technology of smartphone_technologies) {
    technologies.forEach((item, i) => {
      if (smartphone_technology.technologyId == item.id) {
        technologies[i].smartphoneCompat = smartphone_technology.compatible
      }
    });
  }

  //Obtenemos comaptibilidad de smartphone y frecuencia
  smartphone_frequencies = await models.smartphone_frequency.findAll({where: {smartphoneId: smartphone.id}, attributes: ['frequencyId', 'compatible'], raw:true});
  for (frequency_generation of genList){
    for(frequency of frequency_generation.frequencies){
      smartphone_frequencies.forEach((item, i) => {
        if (item.frequencyId == frequency.id) {
          frequency.smartphoneCompat = item.compatible;
        }
      });
    }
  }
  console.log(generations);
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

router.get('/agregar', async (req, res) => {

  //Obtenemos todas las generaciones de frecuencias y sus respectivas frecuencias
  generations = await models.generation.findAll();
  genList = []
  var genIter = 0;
  for (generation of generations) {
    var freqIter = 0;
    genList[genIter] = {};
    genList[genIter].name = generation.name
    genList[genIter].id = generation.id
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

  //Obtenemos todas las tecnologías
  technologies = await models.technology.findAll({attributes:['id', 'name'], raw:true});
  techList = [];
  var techiter = 0;
  for (technology of technologies) {
    techList[techiter]
  }

  console.log(genList);
  console.log(technologies);
  res.render('agregar', {
    version: process.env.VERSION,
    generations: genList,
    technologies: technologies
  })
})

router.post('/agregar', async (req,res) => {
  console.log(req.body);
  console.log(req.body['g-recaptcha-response']);
  captcha = await axios.post('https://www.google.com/recaptcha/api/siteverify', undefined, {
    params: {
      secret: '6Ld4Pw0aAAAAAKYE_fmZaiIZ1cUeNxfAf9ictZFE',
      response: req.body['g-recaptcha-response']
    }
  })
  console.log(captcha.data.success);
  if (captcha.data.success == true) {
    res.clearCookie('message');
    res.cookie('message', {type:'success', message:'Teléfono agregado con éxito.'});
    res.redirect('/')
  }
  else {
    res.clearCookie('message');
    res.cookie('message', {type:'danger', message:'Ocurrió un error al agregar el teléfono.'});
    res.redirect('/agregar')
  }

})

module.exports = router;
