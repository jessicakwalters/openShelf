'use strict'

//App Dependencies
const express = require('express');
const superagent = require('superagent');

//App Setup
const app = express();
const PORT = process.env.PORT || 3000

//App Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

//View engine
app.set('view engine', 'ejs');

//API ROUTES

app.get('/', (req, res) => {
    res.render('pages/index');
});

//Liste
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
});
