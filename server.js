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
// app.post('/search', goSearch);

//================================HOME=======================================
function goHome(request, response){
  response.render('pages/index')
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