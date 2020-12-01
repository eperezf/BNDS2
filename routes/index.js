var express = require('express');
var router = express.Router();
const { models } = require('../sequelize');

/* GET home page. */
router.get('/', async (req, res, next) => {
  operators=await models.operator.findAll({raw: true, attributes: ['name','id']})
  console.log(operators)
  res.render('index', { title: 'BNDS', operators: operators });
});

router.get('/acerca-de', async (req, res, next) => {
  res.render('acerca-de', { title: 'BNDS' });
});
router.post('/resultado', async (req, res) => {

  //Obtenemos la operadora
  operator = await models.operator.findOne({
    where: {
      name: req.body.operator
    },
    attributes: ['id', 'name', 'urlWeb', 'urlLogo'],
  });

  //Obtenemos el smartphone
  smartphone = await models.smartphone.findOne({
    where: {
      fullName: req.body.name
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

  // TEMP: Mostramos los resultados en JSON. Deberían ir como parámetros al render
  res.status(200).json({
    operator: operator,
    smartphone: smartphone,
    frequencies: genList,
    technologies: technologies
  });
})

module.exports = router;
