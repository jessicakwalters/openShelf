'use strict'

//App Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');

//Environment Variables
require('dotenv').config();

//App Setup
const app = express();
const PORT = process.env.PORT || 3000
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

client.on('error', (error) => {
  console.log(error);
});

//App Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

//View engine
app.set('view engine', 'ejs');

//API ROUTES

app.get('/', getBooks);
app.post('/search', createSearch);
app.get('/search', newSearch);
app.get('*', showError);

//Helper

function Book(info) {
  this.image = checkData(info, 'image');
  this.title = checkData(info, 'title');
  this.authors = checkData(info, 'authors');
}

function checkData(info, property) {
  switch(property) {
  case 'image':
    return(info.volumeInfo.imageLinks ? info.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128X192');
  case 'title' :
    return(info.volumeInfo.title ? info.volumeInfo.title : 'No title available');
  case 'authors' :
    return(info.volumeInfo.authors ? info.volumeInfo.authors : 'No authors available');
  }
}

function handleError(error, response) {
  console.error(error);
  if(response) {
    return response.status(500).send('Sorry something went wrong');
  }
}
function showError(request, response) {
  response.render('pages/error');
}

function newSearch(request, response) {
  response.render('pages/searches/new');
}

function getBooks( request, response ){
  let SQL = 'SELECT * FROM books;';
  return client.query(SQL)
    .then( results => {
      console.log(results.rowCount, results.rows);
      if( results.rowCount === 0 ){
        response.render('/pages/index');
      } else { response.render('pages/index', { books: results.rows, rowCount: results.rowCount } ) }
    })
    .catch( (error) => {
      handleError( error, response )});
}

function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') {
    url += `+intitle:${request.body.search[0]}`;
  }
  if (request.body.search[1] === 'author') {
    url += `+inauthor:${request.body.search[0]}`;
  }

  superagent.get(url)
    .then( (results) => {
      let data = results.body.items.map ( (bookInfo) => {
        return new Book(bookInfo);
      })
      return data;
    }).then( results => {
      response.render('pages/searches/show', { searchResults: results });
    })
    .catch( (error) => {
      handleError(error , response);
    })

}

//Listen
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`)
});
