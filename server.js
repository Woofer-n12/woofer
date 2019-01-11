'use strict';
//================================Dependencies===================
const express = require('express');
const pg = require('pg');
const superAgent = require('superagent');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT;

//==================Set EJS==================================
app.set('view engine', 'ejs');
//=======================PG setup===============================
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));







//==================Listener============================
app.listen(PORT, () => console.log(`APP is up on PORT : ${PORT}`));