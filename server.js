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
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
//=============================PG setup===============================
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

//========================REQUEST CALLS==============================
app.get('/', goHome);
app.post('/search', goSearch);

//================================HOME=======================================


//==============================SEARCH=====================================
function goSearch(req,  res){
    searchApi(req.body.search[0])
    .then(data => {
        let newData = JSON.parse(data);
        newData.body.petfinder.pets.pet.forEach(ele => {
            new Dog(ele);
        });
    })
    .catch(er => console.log(er));
}


function searchApi(zip){
    return superAgent.get(`http://api.petfinder.com/pet.find?key=4c25c02137bff6c103c819f8d62a1654&format=json&animal=dog&location=${zip}`);
}

//==================CONSTRUCTORS=================================
function  Dog = (pet){
    this.ID = pet.id.$t;
    this.locationID = pet.shelterId.$t
    this.name = pet.name.$t;
    this.age = pet.age.$t
    this.gender = pet.sex.$t; 
    this.housetrained = false;
    this.size = pet.size.$t;
    this.fixed = false;
    this.catFriendly = true;
    this.kidFriendly = true;
    this.vaccinated = false;
    this.isAdopted = pet.status.$t;
    this.breed = pet.breeds.breed.pet.id.$t;
    this.mix = pet.mix.$t;
    this.picture = pet.media.photos.photo//returns an array
    this.description = pet.description.$t;
    this.options(pet);
}
Dog.prototype.options = function(pet){
    pet.options.option.forEach(ele => {
        if(ele === 'noCats'){
            this.catFriendly = false;
        }else if(ele === 'altered'){
            this.fixed = true;
        }else if(ele === 'hasShots'){
            this.vaccinated = true;
        }else if(ele === 'housetrained'){
            this.housetrained = true;
        }else if(ele === 'noKids'){
            this.kidFriendly = false;
        }
    });
}
//===========================Listener============================
app.listen(PORT, () => console.log(`APP is up on PORT : ${PORT}`));