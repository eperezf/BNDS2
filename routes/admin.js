var express = require('express');
var router = express.Router();
const { models } = require('../sequelize');
const { Op } = require("sequelize");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const passport = require("passport");


//
// Login Routes
//

// Login (GET)
router.get('/login', async (req, res)=>{
  var message
  if (req.cookies.message) {
    console.log(message);
    message = req.cookies.message
    res.clearCookie('message');
  }
  res.render("admin/login", { title: 'admin - BNDS', version: process.env.VERSION, message:message})
})

// Login (POST)
router.post('/login', async(req,res, next)=>{
  var maxAge = 86400000;
  var expiresIn = "1d";
  passport.authenticate('local', {session: false}, (err, user, info) => {
    if (err || !user) {
      res.cookie('message', {type:'danger', message:'Correo o contraseña incorrecto'});
      return res.redirect('/admin/login');
    }
    req.login(user, {session: false}, (err) => {
      if (err) {
        res.send(err);
      }
      else{
        const token = jwt.sign({user, iat: Math.floor(Date.now()/1000)}, process.env.JWT_SECRET, {expiresIn: expiresIn, });
        res.cookie('token', token, {maxAge: maxAge, secure: false, httpOnly: true,});
        return res.redirect('/admin')
      }
    });
  })(req, res);
});

// Logout (GET)
router.get('/logout', async(req,res)=> {
  res.clearCookie('token');
  res.cookie('message', {type:'success', message:'Sesión cerrada con éxito'});
  return res.redirect('/admin/login');
})

// Index (GET)

router.get('/',passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=>{
  const pending = await models.smartphone.count({where: {visible: 0}});
  const active = await models.smartphone.count({where: {visible: 1}});
  res.render("admin/index", {name:req.user.user.name, pending:pending, active:active})
})

//
// Operator CRUD Routes
//

// Read (GET)
router.get('/operators', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=> {
  operators=await models.operator.findAll({raw: true, attributes: ['name','id']})
  res.render("admin/operators/list", {operators:operators});
})

// Update (GET)
router.get('/operators/edit/:id', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=> {
  genList = await getFrequencies();

  // Operator Technologies
  operator =await models.operator.findOne({raw: true, where:{id:req.params.id}})
  technologies=await models.technology.findAll({raw: true})
  operator_technologies = await models.operator_technology.findAll({where: {operatorId: operator.id}, raw:true});
  for (operator_technology of operator_technologies) {
    technologies.find(x => x.id === operator_technology.technologyId).operatorCompat = operator_technology.compatible
  }
  technologies.forEach((item, i) => {
    if (item.operatorCompat === undefined) {
      item.operatorCompat = 2
    }
  });

  // Operator Frequencies
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

  // Render
  res.render("admin/operators/edit", {operator:operator, generations: genList, technologies:technologies});
})


// Technologies Routes

// List
router.get('/technologies', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=> {
  technologies=await models.technology.findAll({raw: true})
  res.render("admin/technologies/list", {technologies:technologies});
})

// Generations Routes

// List
router.get('/generations', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=> {
  generations=await models.generation.findAll({raw: true})
  res.render("admin/generations/list", {generations:generations});
})

// Frequencies Routes

// List
router.get('/frequencies', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=> {
  //Obtenemos todas las generaciones de frecuencias y sus respectivas frecuencias
  genList = await getFrequencies();
  res.render("admin/frequencies/list", {genList:genList});
})

/*
 * Smartphone CRUD Routes
 * Create: Create a smartphone and its technology and frequency associations
 * Read: List all the smartphones
 * Update: Update a smartphone and its technology and frequency associations
 * Delete: Delete a smartphone and its technology and frequency associations
 */
// Smartphone CRUD Routes

// Read (GET)
router.get('/smartphones', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=> {
  smartphones=await models.smartphone.findAll({raw: true})
  res.render("admin/smartphones/list", {smartphones:smartphones});
})

// Create (GET)
router.get('/smartphones/add', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=> {
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
  res.render('admin/smartphones/add', {
    version: process.env.VERSION,
    generations: genList,
    technologies: technologies,
    sitekey: process.env.RECAPTCHA_SITE_KEY
  })
})




async function getFrequencies (){
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
  return genList;
}

module.exports = router;
