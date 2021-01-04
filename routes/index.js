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
    res.clearCookie('message');
  }
  res.render('index', {
    title: 'BNDS',
    operators: operators,
    message:message,
    environment: process.env.NODE_ENV,
    sitekey: process.env.RECAPTCHA_SITE_KEY
  });
});

router.get('/acerca-de', async (req, res, next) => {
  res.render('acerca-de', { title: 'BNDS'});
});

router.post('/resultado', async (req, res) => {

  captcha = await axios.post('https://www.google.com/recaptcha/api/siteverify', undefined, {
    params: {
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: req.body['g-recaptcha-response']
    }
  })
  if (process.env.NODE_ENV == 'development') {
    captcha.data.success = true //Captcha always true for testing purposes
  }
  if (captcha.data.success == true) {
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
    smartphone_technologies = await models.smartphone_technology.findAll({where: {smartphoneId: smartphone.id}, raw:true});
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
      environment: process.env.NODE_ENV
    });
  }
  else {
    res.cookie('message', {type:'danger', message:'Error de búsqueda.'});
    return res.redirect('/')
  }
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
  res.render('agregar', {
    generations: genList,
    technologies: technologies,
    sitekey: process.env.RECAPTCHA_SITE_KEY,
    environment: process.env.NODE_ENV
  })
})

router.post('/agregar', async (req,res) => {

  captcha = await axios.post('https://www.google.com/recaptcha/api/siteverify', undefined, {
    params: {
      secret: process.env.RECAPTCHA_SECRET_KEY,
      response: req.body['g-recaptcha-response']
    }
  })

  if (captcha.data.success == true) {
    var checkDupe = await models.smartphone.findOne({
      where: {
        fullName: req.body.brand + " " + req.body.model + " " + req.body.variant
      }
    });
    if (checkDupe == null) {
      var phone = await models.smartphone.create({
        brand: req.body.brand,
        model: req.body.model,
        variant: req.body.variant,
        fullName: req.body.brand + " " + req.body.model + " " + req.body.variant,
        visible: 0
      })
    }
    else {
      res.clearCookie('message');
      res.cookie('message', {type:'success', message:'El teléfono que querías agregar ya existe o ya fue solicitado.'});
      res.redirect('/')
      return;
    }
    req.body.technology.forEach((item, i) => {
      console.log(item);
      if (item.status == 'true') {
        var smartTech = models.smartphone_technology.create({
          smartphoneId: phone.dataValues.id,
          technologyId: item.id,
          compatible: true
        })
      }
      else if (item.status == 'false'){
        var smartTech = models.smartphone_technology.create({
          smartphoneId: phone.dataValues.id,
          technologyId: item.id,
          compatible: false
        })
      }
    });
    req.body.frequency.forEach((item, i) => {
      if (item.status == 'true') {
        var smartTech = models.smartphone_frequency.create({
          smartphoneId: phone.dataValues.id,
          frequencyId: item.id,
          compatible: true
        })
      }
      else if (item.status == 'false'){
        var smartTech = models.smartphone_frequency.create({
          smartphoneId: phone.dataValues.id,
          frequencyId: item.id,
          compatible: false
        })
      }
    });
    res.clearCookie('message');
    res.cookie('message', {type:'success', message:'Teléfono solicitado con éxito.'});
    res.redirect('/')
  }
  else {
    res.clearCookie('message');
    res.cookie('message', {type:'danger', message:'Ocurrió un error al agregar el teléfono.'});
    res.redirect('/agregar')
  }
})

module.exports = router;
