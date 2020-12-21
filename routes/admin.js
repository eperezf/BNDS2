var express = require('express');
var router = express.Router();
const { models } = require('../sequelize');
const { Op } = require("sequelize");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const passport = require("passport");

router.get('/login', async (req, res)=>{
  var message
  if (req.cookies.message) {
    console.log(message);
    message = req.cookies.message
    res.clearCookie('message');
  }
  res.render("admin/login", { title: 'admin - BNDS', version: process.env.VERSION, message:message})
})

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

router.get('/',passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=>{
  const pending = await models.smartphone.count({where: {visible: 0}});
  const active = await models.smartphone.count({where: {visible: 1}});
  res.render("admin/index", {name:req.user.user.name, pending:pending, active:active})
})

// Operator Routes

// List
router.get('/operators', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=> {
  operators=await models.operator.findAll({raw: true, attributes: ['name','id']})
  res.render("admin/operators/list", {operators:operators});
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

  res.render("admin/frequencies/list", {genList:genList});
})


// Smartphone Routes

// List
router.get('/smartphones', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=> {
  smartphones=await models.smartphone.findAll({raw: true})
  res.render("admin/smartphones/list", {smartphones:smartphones});
})


module.exports = router;
