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

  console.log(request.body);

  if (request.body.search[1] === 'title') {
    url += `+intitle:${request.body.search[0]}`;
  }
  if (request.body.search[1] === 'author') {
    url += `+inauthor:${request.body.search[0]}`;
  }

  superagent.get(url)
    .then( (results) => {
      console.log(results.body.items[0]);
      results.body.items.map ( (bookInfo) => {
        let newBook = new Book(bookInfo);
        //console.log(newBook);
      })
    })
    .catch( (error) => {
      console.error(error);
    })

}

//Listen
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`)
});
