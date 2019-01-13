// ====================================================================
// ==================TEST SERVER!!!!!!=================================
// ====================================================================
'use strict';
//================================Dependencies==========================
const express = require('express');
const pg = require('pg');
const superAgent = require('superagent');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;

//==========================Set EJS==================================
app.set('view engine', 'ejs');
app.use(express.static('./public'));
//=============================PG setup===============================
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

//========================REQUEST CALLS==============================
app.get('/', goHome);
app.get('/searchResult', searchList) //just for testing
app.get('/woof-list', wooflist)
// app.post('/search', goSearch);

//================================HOME=======================================
function goHome(request, response){
  response.render('pages/index')
}

function searchList(request, response){
  response.render('pages/choices/dogShow')
}

function wooflist(request, response){
  response.render('pages/wooflist/listShow')
}
//==============================SEARCH=====================================
// function goSearch(req,  res){
//     searchApi(req.body.search[0]);
// }


// function searchApi(zip){
//     return superAgent.get(`http://api.petfinder.com/pet.find?key=4c25c02137bff6c103c819f8d62a1654&format=json&animal=dog&location=${zip}`);
// }
//===========================Listener============================
app.listen(PORT, () => console.log(`APP is up on PORT : ${PORT}`));
// ====================================================================
// ================= END TEST SERVER!!!!!!=============================
// ====================================================================
// =======
// 'use strict';
// //================================Dependencies==========================
// const express = require('express');
// const pg = require('pg');
// const superAgent = require('superagent');
// const cors = require('cors');
// require('dotenv').config();
// const app = express();
// const PORT = process.env.PORT;

// //==========================Set EJS==================================
// app.set('view engine', 'ejs');
// //=====================FOR URL========================================
// app.use(express.urlencoded({extended: true,}));
// app.use(express.static(__dirname + '/public'));
// app.use(express.static('./public'));
// //=============================PG setup===============================
// const client = new pg.Client(process.env.DATABASE_URL);
// client.connect();
// client.on('error', err => console.error(err));

// //========================REQUEST CALLS==============================
// app.get('/', goHome);
// app.post('/available-dogs', goDogs);

// //================================HOME=======================================
// function goHome(req, res){
//   res.render('views/pages/index.ejs')
//     .then(()=>{
//       checkUser();
//     })
//     .catch(err => {
//       console.log(err);
//     });
// }
// //==================CHECK USER===========================================
// function checkUser(){
//   if (!localStorage.getItem('userId')){
//     let SQL = `INSERT INTO users
//                 (liked, viewed)
//                 VALUES ($1, $2)
//                 RETURNING id`;
//     let values = ['', ''];
//     return client.query(SQL, values)
//       .then(data =>{
//         localStorage.setItem('userId', JSON.stringify(data.rows[0].id));
//       })
//       .catch(err =>{
//         console.log(err);
//       });
//   }
// }
// //==============================SEARCH=====================================
// function goDogs(req, res){
//   checkUser();
//   searchApiForShelters(req.body.search[0])
//     .then(() => {

//     })
//     .catch(err => {console.log(err);
//     });

//   searchApiForDogs(req.body.search[0])
//     .then(data => {
//       let newData = JSON.parse(data);
//       let dataArray = [];
//       newData.body.petfinder.pets.pet.forEach(ele => {
//         dataArray.push(new Dog(ele));
//       });
//       res.render('views/pages/choices/dogShow.ejs', {dataArray});
//     })
//     .catch(er => console.log(er));
// }

// function searchApiForShelters(zip){
//   return superAgent.get(`http://api.petfinder.com/shelter.find?key=4c25c02137bff6c103c819f8d62a1654&format=json&location=${zip}`).then(data => {
//     let SQL = `INSERT INTO shelters
//                 (shelters_id, name, city, state, zip, phone, email)
//                 VALUES ($1, $2, $3, $4, $5, $6, $7)
//                 RETURNING id`
//     let newData = JSON.parse(data);
//     let dataArray = newData.body.petfinder.shelters.shelter.map(ele => {
//       new Shelter(ele);
//     });
//     dataArray.forEach(ele => {
//       let values = [ele.shelters_id, ele.name, ele.city, ele.state, ele.zip, ele.phone, ele.email];
//       return client.query(SQL, values);
//     });
//   }).catch(err => {
//     console.log(err);
//   });
// }

// function searchApiForDogs(zip){
//   return superAgent.get(`http://api.petfinder.com/pet.find?key=4c25c02137bff6c103c819f8d62a1654&format=json&animal=dog&location=${zip}`);
// }

// //==================CONSTRUCTORS=================================
// function Dog(pet){
//   this.ID = pet.id.$t;
//   this.locationID = pet.shelterId.$t;
//   this.name = pet.name.$t;
//   this.age = pet.age.$t;
//   this.gender = pet.sex.$t;
//   this.housetrained = false;
//   this.size = pet.size.$t;
//   this.fixed = false;
//   this.catFriendly = true;
//   this.kidFriendly = true;
//   this.vaccinated = false;
//   this.isAdopted = pet.status.$t;
//   this.breed = pet.breeds.breed.pet.id.$t;
//   this.mix = pet.mix.$t;
//   this.picture = pet.media.photos.photo;//returns an array
//   this.description = pet.description.$t;
//   this.options(pet);
// }

// Dog.prototype.options = function(pet){
//   pet.options.option.forEach(ele => {
//     if(ele === 'noCats'){
//       this.catFriendly = false;
//     }else if(ele === 'altered'){
//       this.fixed = true;
//     }else if(ele === 'hasShots'){
//       this.vaccinated = true;
//     }else if(ele === 'housetrained'){
//       this.housetrained = true;
//     }else if(ele === 'noKids'){
//       this.kidFriendly = false;
//     }
//   });
// }

// function Shelter(shelter){
//   this.shelters_id = shelter.id.$t;
//   this.name = shelter.name.$t;
//   this.city = shelter.city.$t;
//   this.state = shelter.state.$t;
//   this.zip = shelter.zip.$t;
//   this.phone = shelter.phone.$t;
//   this.email = shelter.email.$t;
// }
// //===========================Listener============================
// app.listen(PORT, () => console.log(`APP is up on PORT : ${PORT}`));

