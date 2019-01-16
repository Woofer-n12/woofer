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
//==================CHECK USER===========================================
function makeUser(req, res){
  let SQL = `INSERT INTO users
                (likes, views)
                VALUES ($1, $2)
                RETURNING id`;

  let like=[];
  let view=[];
  let values = [JSON.stringify(like), JSON.stringify(view)];
  return client.query(SQL, values)
    .then(data =>{
      res.render('pages/index2.ejs', {userId: data.rows[0].id});
      // localStorage.setItem('userId', JSON.stringify(data.rows[0].id));
    })
    .catch(err =>{
      console.log(err);
    });
}
//==============================SEARCH=====================================
function goDogs(req, res){
  searchApiForShelters(req.body.search);

  searchApiForDogs(req.body.search)
    .then(data => {
      let newData = data;
      //console.log(newData.body.petfinder.pets.pet[0].options);
      let dataArray = [];
      newData.body.petfinder.pets.pet.forEach(ele => {
        dataArray.push(new Dog(ele));
      });
      // console.log (dataArray[0]);
      res.render('pages/choices/dogShow.ejs', {dataArray});
    })
    .catch(er => console.log(er));
}
function searchApiForShelters(zip){
  return superAgent.get(`http://api.petfinder.com/shelter.find?key=${process.env.PET_KEY}&format=json&location=${zip}`)
    .then(data => {
      let newData = data;
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
function searchApiForDogs(zip){
  let dataArray = [];
  superAgent.get(`http://api.petfinder.com/pet.find?key=${process.env.PET_KEY}&format=json&animal=dog&location=${zip}`)
    .then(data=>{
      let newData = data;
      newData.body.petfinder.pets.pet.forEach(ele => {
        dataArray.push(new Dog(ele));
      });
      let SQL = `INSERT INTO dogs
      (dog_id, name, age, gender, size, availability, breed, mix, photos, description, shelter_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
      dataArray.forEach(ele=>{
        let values =[ele.ID, ele.name, ele.age, ele.gender, ele.size, ele.isAdopted, ele.breed, ele.mix, ele.picture, ele.description, ele.locationID];
        client.query(SQL, values).catch(er => console.log(er));
      })
    }).catch(err => {
      console.log(err);
    });
  return dataArray;
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
      console.log(`dog with id  ${dogid} was added to the table @ user id ${userid}`);
    }).catch(err => {
      console.log(err);
    });
}

function viewDog(req,res){
  let userid=req.body.userId;
  let dogid=req.body.dogId;
  let SQL=`SELECT * FROM users WHERE id = $1`;
  client.query(SQL,[userid])
    .then (data=>{
      let views = JSON.parse(data.rows[0].views);
      views.push(dogid);
      let SQL2 = `UPDATE users SET views=$1 WHERE id=$2`;
      let value2 = [JSON.stringify(views), userid];
      client.query(SQL2, value2);
      console.log(`dog with id  ${dogid} was added to the table @ user id ${userid}`);
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
  this.picture = pet.media.photos.photo;//returns an array
  this.description = pet.description.$t;
  this.options(pet);
}
Dog.prototype.options = function(pet){
  // console.log(pet);
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
