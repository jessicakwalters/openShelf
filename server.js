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
app.get('/', newSearch);
app.post('/', createSearch);
app.get(`*`, (showError));

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

//error messages

function handleError(error, response) {
  console.error(error);
  if(response) {
    return response.status(500).send('Sorry something went wrong');
  }
}
function showError(request, response) {
  response.render('pages/error');
}
////
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
      handleError(error , response);
    })

}
console.log();

//Listen
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`)
});
