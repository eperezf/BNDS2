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
  console.log(req.user.user);
  res.render("admin/index", {name:req.user.user.name})
})


module.exports = router;
