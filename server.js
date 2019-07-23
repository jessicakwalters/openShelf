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

// app.get('/', (req, res) => {
//     res.render('pages/index');
// });
app.get('/search', newSearch);
app.post('/search', createSearch);
app.post

//Helper

function Book(info) {
  this.image = info.volumeInfo.imageLinks.thumbnail;
  this.title = info.volumeInfo.title;
  this.authors = info.volumeInfo.authors;
}

function newSearch(request, response) {
  response.render('pages/index');
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
      let test = results.body.items.map ( (bookInfo) => {
        return new Book(bookInfo);
      })
      console.log('this is the first then', test);
      return test;
    }).then( results => {
      console.log('this should be an array', results);
      response.render('pages/searches/show', { searchResults: results });
    })
    .catch( (error) => {
      console.error(error);
    })

}
console.log();

//Listen
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`)
});
