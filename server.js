'use strict';
//================================Dependencies==========================
const express = require('express');
const pg = require('pg');
const superAgent = require('superagent');
const cors = require('cors');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT;

//==========================Set EJS==================================
app.set('view engine', 'ejs');
//=====================FOR URL========================================
app.use(express.urlencoded({extended: true,}));
app.use(express.static(__dirname + '/public'));
app.use(express.static('./public'));
//=============================PG setup===============================
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

//========================REQUEST CALLS==============================
app.get('/', goHome);
app.post('/available-dogs', goDogs);
app.post('/user', makeUser);
app.get('/about-the-team', aboutTeam);
app.post('/woof-list', woofList);
app.get('/dog-detail', dogDetail); //need to modify for a specific dog and add a click handler on wooflist
app.post('/likedog', likeDog);
app.post('/dogviewed', viewDog);


//================================HOME=======================================
function goHome(req, res){
  res.render('pages/index.ejs');
}
//=============================ABOUT US ===================================
function aboutTeam(request, response){
  response.render('pages/about');
}
// ===========================WOOF LIST==================================

function woofList(request, response){
  let likedDogs = [];
  console.log(request.body);
  let id = request.body.username;
  let SQL=`SELECT likes FROM users WHERE id = $1`;
  client.query(SQL,[id])
    .then(data=>{
      let likes = JSON.parse(data.rows[0].likes)
      let string = ''
      for(let i=1 ; i<=likes.length; i++) {
        string += '$' + i + ', ';
      }
      let nstring = string.substring(0, string.length-2);
      console.log(nstring);
      let SQL2 = `SELECT * FROM dogs WHERE dog_id IN (${nstring})`;
      client.query(SQL2, likes)
        .then(result => {
          result.rows.forEach(row => {
            likedDogs.push(new DBDog(row))
            console.log(`new dog created, ${likedDogs.length}`)
          })
          console.log(`rendering wooflist`);
          response.render('pages/wooflist/listShow.ejs',{likedDogs});
        }).catch((err)=>{console.log(err)});
    }).catch((err)=>{console.log(err)});
}

// =============================DOG DETAIL ================================
function dogDetail(req,res){
  let SQL = `SELECT * FROM dogs WHERE dog_id=$1`;
  let dogId = req.body.dogId;
  return client.query(SQL, [dogId])
  .then(data => {
    return new DBDog(data.rows[0]);
  })
  .then(dog => {
    let SQL = `SELECT * FROM shelters WHERE shelters_id=$1`;
    return client.query(SQL, [dog.loactionID])
    .then(data => {
      if(data.rows[0]){
        let shelterDeet = new DBShelter(data.rows[0]);
        res.render('pages/wooflist/dogDetail', {dogDeets: dog, shelterDeets: shelterDeet});
      }else{
        superAgent.get(`http://api.petfinder.com/shelter.get?key=${process.env.PET_KEY}&format=json&id=${dog.locationID}`)
        .then(data => {
          let shelterDeet = new IndiShelter(data.body.petfinder.shelter);
          let SQL = `INSERT INTO shelters
                (shelters_id, name, city, state, zip, phone, email)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id`;
          let values = [shelterDeet.shelters_id, shelterDeet.name, shelterDeet.city, shelterDeet.state, shelterDeet.zip, shelterDeet.phone, shelterDeet.email];
          client.query(SQL, values);
          res.render('pages/wooflist/dogDetail', {dogDeets: dog, shelterDeets: shelterDeet});
        })
        .catch(err => {
          console.log(err);
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
  })
  .catch(err => {
    console.log(err);
  });
}
//==================CHECK USER===========================================
function makeUser(req, res){
  let SQL = `INSERT INTO users
                (likes, views)
                VALUES ($1, $2)
                RETURNING id`;
  let likes = [];
  let views = [];
  let values = [JSON.stringify(likes), JSON.stringify(views)];

  return client.query(SQL, values)
    .then(data =>{
      console.log(data.rows[0].id);
      res.render('pages/index2.ejs', {userId: data.rows[0].id});
    })
    .catch(err =>{
      console.log(err);
    });
}
//==============================SEARCH=====================================

function goDogs(req, res){
  let dataArray = [];
  searchApiForShelters(req.body.search);
  superAgent.get(`http://api.petfinder.com/pet.find?key=${process.env.PET_KEY}&format=json&animal=dog&location=${req.body.search}`)
    .then(data=>{
      data.body.petfinder.pets.pet.forEach(ele => {
        dataArray.push(new Dog(ele));
      });
      let SQL = `INSERT INTO dogs
      (dog_id, name, age, gender, size, availability, breed, mix, photos, description, shelter_id, options) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`
      dataArray.forEach(ele=>{
        let values =[ele.ID, ele.name, ele.age, ele.gender, ele.size, ele.isAdopted, ele.breed, ele.mix, ele.picture, ele.description, ele.locationID, ele.opt];
        client.query(SQL, values).catch(er => console.log(er));
      })
    }).then(()=>{
      res.render('pages/choices/dogShow.ejs', {dataArray});
    }).catch(err => {
      console.log(err);
    });
}

function searchApiForShelters(zip){
  return superAgent.get(`http://api.petfinder.com/shelter.find?key=${process.env.PET_KEY}&format=json&location=${zip}`)
    .then(data => {
      let SQL = `INSERT INTO shelters
                (shelters_id, name, city, state, zip, phone, email)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id`;
      let dataArray = [];
      data.body.petfinder.shelters.shelter.forEach(ele => {
        dataArray.push(new Shelter(ele));
      });
      dataArray.forEach(ele => {
        let values = [ele.shelters_id, ele.name, ele.city, ele.state, ele.zip, ele.phone, ele.email];
        return client.query(SQL, values);
      });
    }).catch(err => {
      console.log(err);
    });
}
//==================likedogs=======================
function likeDog(req, res){
  let userid=req.body.userId;
  let dogid=req.body.dogId;
  let SQL=`SELECT * FROM users WHERE id = $1`;
  client.query(SQL,[userid])
    .then (data=>{
      console.log(data.rows);
      let likes = JSON.parse(data.rows[0].likes);
      console.log(likes);
      let views = JSON.parse(data.rows[0].views);
      likes.push(dogid);
      views.push(dogid);
      let SQL2 = `UPDATE users SET likes=$1, views=$2 WHERE id=$3`;
      let value2 = [JSON.stringify(likes), JSON.stringify(views), userid];
      client.query(SQL2, value2);
      console.log(`dog with id ${dogid} was liked and added to the table @ user id ${userid}`);
    }).catch(err => {
      console.log(err);
    });
}
//====================viewdog==================================================
function viewDog(req,res){
  let userid=req.body.userId;
  let dogid=req.body.dogId;
  let SQL=`SELECT * FROM users WHERE id = $1`;
  client.query(SQL,[userid])
    .then (data=>{
      console.log(data.rows, 'line 137')
      let views = JSON.parse(data.rows[0].views);
      views.push(dogid);
      let SQL2 = `UPDATE users SET views=$1 WHERE id=$2`;
      let value2 = [JSON.stringify(views), userid];
      client.query(SQL2, value2);
      console.log(`dog with id ${dogid} was viewed and added to the table @ user id ${userid}`);
    }).catch(err => {
      console.log(err);
    });
}
//==================CONSTRUCTORS=================================
function Dog(pet){
  this.ID = pet.id.$t;
  this.locationID = pet.shelterId.$t;
  this.name = pet.name.$t;
  this.age = pet.age.$t;
  this.gender = pet.sex.$t;
  this.housetrained = false;
  this.size = pet.size.$t;
  this.fixed = false;
  this.catFriendly = true;
  this.kidFriendly = true;
  this.vaccinated = false;
  this.isAdopted = pet.status.$t;
  this.breed = pet.breeds.breed.$t||'Unknown';
  this.mix = pet.mix.$t;
  this.picture = pet.media.photos.photo || 'images/connor-dog.png';
  this.description = pet.description.$t;
  this.options(pet)
  this.opt=pet.options.option;
}
Dog.prototype.options = function(pet){
  if (Array.isArray(pet.options.option)){
    pet.options.option.forEach(ele => {
      if(ele.$t === 'noCats'){
        this.catFriendly = false;
      }else if(ele.$t === 'altered'){
        this.fixed = true;
      }else if(ele.$t === 'hasShots'){
        this.vaccinated = true;
      }else if(ele.$t === 'housetrained'){
        this.housetrained = true;
      }else if(ele.$t === 'noKids'){
        this.kidFriendly = false;
      }
    });
  }else if (pet.options.option){
    let derp = pet.options.option;
    if(derp.$t === 'noCats'){
      this.catFriendly = false;
    }else if(derp.$t === 'altered'){
      this.fixed = true;
    }else if(derp.$t === 'hasShots'){
      this.vaccinated = true;
    }else if(derp.$t === 'housetrained'){
      this.housetrained = true;
    }else if(derp.$t === 'noKids'){
      this.kidFriendly = false;
    }
  }
}
function DBDog(pet){
  this.ID = pet.dog_id;
  this.locationID = pet.shelter_id;
  this.name = pet.name;
  this.age = pet.age;
  this.gender = pet.gender;
  this.housetrained = false;
  this.size = pet.size.$t;
  this.fixed = false;
  this.catFriendly = true;
  this.kidFriendly = true;
  this.vaccinated = false;
  this.isAdopted = pet.availability;
  this.breed = pet.breed;
  this.mix = pet.mix;
  this.picture = pet.photos;//returns an array
  this.description = pet.description;
  // console.log(this);
}
DBDog.prototype.options = function(pet){
  if (Array.isArray(pet.options)){
    pet.options.forEach(ele => {
      if(ele.$t === 'noCats'){
        this.catFriendly = false;
      }else if(ele.$t === 'altered'){
        this.fixed = true;
      }else if(ele.$t === 'hasShots'){
        this.vaccinated = true;
      }else if(ele.$t === 'housetrained'){
        this.housetrained = true;
      }else if(ele.$t === 'noKids'){
        this.kidFriendly = false;
      }
    });
  }else if (pet.options){
    let derp = pet.options;
    if(derp.$t === 'noCats'){
      this.catFriendly = false;
    }else if(derp.$t === 'altered'){
      this.fixed = true;
    }else if(derp.$t === 'hasShots'){
      this.vaccinated = true;
    }else if(derp.$t === 'housetrained'){
      this.housetrained = true;
    }else if(derp.$t === 'noKids'){
      this.kidFriendly = false;
    }
  }
}
function Shelter(shelter){
  this.shelters_id = shelter.id.$t;
  this.name = shelter.name.$t;
  this.city = shelter.city.$t;
  this.state = shelter.state.$t;
  this.zip = shelter.zip.$t;
  this.phone = shelter.phone.$t;
  this.email = shelter.email.$t;
}
//===========================Listener============================
app.listen(PORT, () => console.log(`APP is up on PORT : ${PORT}`));

function DBShelter(shelter){
  this.shelters_id = shelter.shelters_id;
  this.name = shelter.name;
  this.city = shelter.city;
  this.state = shelter.state;
  this.zip = shelter.zip;
  this.phone = shelter.phone;
  this.email = shelter.email;
}

function IndiShelter(shelter){
  this.shelters_id = shelter.id.$t;
  this.name = shelter.name.$t;
  this.city = shelter.city.$t;
  this.state = shelter.state.$t;
  this.zip = shelter.zip.$t;
  this.phone = shelter.phone.$t;
  this.email = shelter.email.$t;
}