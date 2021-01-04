var express = require('express');
var router = express.Router();
const { models } = require('../sequelize');
const { Op } = require("sequelize");
require('dotenv').config();
const jwt = require('jsonwebtoken');
const passport = require("passport");
var multer  = require('multer');
var upload = multer();
var Jimp = require('jimp');
var slugify = require('slugify')
var aws = require("aws-sdk");

aws.config.update({
  accessKeyId: process.env.AKID,
  secretAccessKey: process.env.SECRET
});

//
// Login Routes
//

// Login (GET)
router.get('/login', async (req, res)=>{
  var message
  if (req.cookies.message) {
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

// Create (GET)
router.get('/operators/add', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=>{
  genList = await getFrequencies();
  technologies = await models.technology.findAll({raw: true});
  res.render('admin/operators/add', {generations:genList, technologies: technologies});
})
// Create (POST)
router.post('/operators/add', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=>{
  const operator = await models.operator.build({
    name: req.body.name,
    urlWeb: req.body.urlWeb,
    urlLogo: req.body.urlLogo
  })
  await operator.save();
  operatorId = operator.dataValues.id;
  req.body.frequency.forEach((item, i) => {
    if (item.status != "unknown") {
      models.operator_frequency.create({
        operatorId: operatorId,

      })
    }
  });
  req.body.technology.forEach((item, i) => {
    if (item.status != "unknown") {
      models.operator_technology.create({
        operatorId: operatorId,

      })
    }
  });

  return res.redirect("/admin/operators")
})

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

// Delete (POST)
router.get('/operators/delete/:id', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=>{
  await models.operator.destroy({
    where: {
      id: req.params.id
    }
  })
  return res.redirect('/admin/operators');
})

//
// Technologies CRUD Routes
//

// Read (GET)
router.get('/technologies', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=> {
  technologies=await models.technology.findAll({raw: true})
  res.render("admin/technologies/list", {technologies:technologies});
})

// Generations CRUD Routes

// Read (GET)
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

// Create (POST)
router.post('/smartphones/add', upload.single('imageUpload'), passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=>{
  var url = slugify(req.body.brand + " " + req.body.model + " " + req.body.variant)
  var checkDupe = await models.smartphone.findOne({
    where: {
      fullName: req.body.brand + " " + req.body.model + " " + req.body.variant
    }
  });
  if (checkDupe == null) {
    try {
      var file = await Jimp.read(Buffer.from(req.file.buffer, 'base64'))
    } catch (e) {
      console.log("IMAGE NOT OK:");
      console.log(e);
      return res.status(500).send("Image error")
    }
    var scaled = await file.scaleToFit(600,900);
    var buffer = await scaled.getBufferAsync(Jimp.AUTO);
    var s3 = new aws.S3({params: {Bucket: process.env.AWS_S3_BUCKET}, endpoint: process.env.AWS_S3_ENDPOINT});
    var params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: "smartphones/"+url+".png",
      ACL: 'public-read',
      Body: buffer
    }
    s3up = await s3.putObject(params, function (err, data) {
      if (err) {
        s3res = err;
      } else {
        s3res = "ok"
      }
    }).promise();
    var phone = await models.smartphone.create({
      brand: req.body.brand,
      model: req.body.model,
      variant: req.body.variant,
      fullName: req.body.brand + " " + req.body.model + " " + req.body.variant,
      imageUrl: 'https://static.bnds.cl/smartphones/'+url+'.png',
      reviewUrl: req.body.reviewUrl,
      visible: 1
    })
  }
  else {
    res.clearCookie('message');
    res.cookie('message', {type:'success', message:'El teléfono que querías agregar ya existe.'});
    res.redirect('/')
    return;
  }
  req.body.technology.forEach((item, i) => {
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
  res.cookie('message', {type:'success', message:'Teléfono agregado con éxito.'});
  res.redirect('/admin/smartphones')
});

// Read (GET)
router.get('/smartphones', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=> {
  smartphones=await models.smartphone.findAll({
    order: [
      ['id', 'DESC']
    ],
    raw: true
  })
  var message
  if (req.cookies.message) {
    message = req.cookies.message
    res.clearCookie('message');
  }
  res.render("admin/smartphones/list", {smartphones:smartphones, message:message});
})

// Update (GET)
router.get('/smartphones/edit/:id', passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=>{
  genList = await getFrequencies();
  smartphone=await models.smartphone.findOne({
    where: {
      id: req.params.id
    }
  })
  technologies = await models.technology.findAll({attributes:['id', 'name'], raw:true});

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
  res.render("admin/smartphones/edit", {generations:genList, technologies:technologies, smartphone:smartphone.dataValues});
})

// Update (POST)

router.post('/smartphones/edit', upload.single('imageUpload'), passport.authenticate('jwt', {session: false, failureRedirect: '/admin/login'}), async(req,res)=>{
  // Check if item is duplicate but not itself (name not modified)
  var imageUrl
  if (req.body.visible == 'true') {
    req.body.visible = 1
  }
  else {
    req.body.visible = 0
  }
  var url = slugify(req.body.brand + " " + req.body.model + " " + req.body.variant)
  var fullName = req.body.brand + " " + req.body.model + " " + req.body.variant;
  var duplicate = await models.smartphone.count({
    where: {
      fullName: fullName,
      [Op.not]: [
        {id: req.body.id}
      ]
    }
  });
  if (duplicate > 0) {
    res.redirect('back');
  }
  else {
    if (req.file) {
      try {
        var file = await Jimp.read(Buffer.from(req.file.buffer, 'base64'))
      } catch (e) {
        console.log("IMAGE NOT OK:");
        console.log(e);
        return res.status(500).send("Image error")
      }
      var scaled = await file.scaleToFit(600,900);
      var buffer = await scaled.getBufferAsync(Jimp.AUTO);
      var s3 = new aws.S3({params: {Bucket: process.env.AWS_S3_BUCKET}, endpoint: process.env.AWS_S3_ENDPOINT});
      var params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: "smartphones/"+url+".png",
        ACL: 'public-read',
        Body: buffer
      }
      s3up = await s3.putObject(params, function (err, data) {
        if (err) {
          s3res = err;
        } else {
          s3res = "ok"
        }
      }).promise();
      imageUrl = "https://static.bnds.cl/smartphones/" + url + ".png"
    }
    updated = await models.smartphone.update(
      {
        brand: req.body.brand,
        model: req.body.model,
        variant: req.body.variant,
        reviewUrl: req.body.reviewUrl,
        visible: req.body.visible,
        imageUrl: imageUrl
    },
    {
      where: {
        id: req.body.id
      }
    })

    //Go over each frequency, see if it exists, modify it, or delete it, or create it.
    await Promise.all(req.body.frequency.map(async(item)=> {
      if (item.status == 'true') {
        item.status = 1
      }
      else if(item.status == 'false'){
        item.status = 0
      }
      else if(item.status == 'unknown'){
        item.status = 2
      }
      var [frequency, created] = await models.smartphone_frequency.findOrCreate({
        where: {
          smartphoneId: req.body.id,
          frequencyId: item.id
        },
        defaults: {
          smartphoneId: req.body.id,
          frequencyId: item.id,
          compatible: item.status
        }
      })
      if (created == false) {
        frequency.compatible = item.status
        await frequency.save()
      }
    }));

    await Promise.all(req.body.technology.map(async(item)=> {
      if (item.status == 'true') {
        item.status = 1
      }
      else if(item.status == 'false'){
        item.status = 0
      }
      else if(item.status == 'unknown'){
        item.status = 2
      }
      var [technology, created] = await models.smartphone_technology.findOrCreate({
        where: {
          smartphoneId: req.body.id,
          technologyId: item.id
        },
        defaults: {
          smartphoneId: req.body.id,
          technologyId: item.id,
          compatible: item.status
        }
      })
      if (created == false) {
        technology.compatible = item.status
        await technology.save()
      }
    }));
  }
  res.cookie('message', {type:'success', message:'Teléfono editado con éxito'});
  res.redirect("/admin/smartphones")
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
