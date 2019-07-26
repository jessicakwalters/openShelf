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
const methodOverride = require('method-override');
client.connect();

client.on('error', (error) => {
  console.log(error);
});

//App Middleware
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(methodOverride((request, response) => {
  if(request.body && typeof request.body === 'object' && '_method' in request.body) {
    let method = request.body._method;
    console.log(method);
    delete request.body._method;
    return method;
  }
}));

//View engine
app.set('view engine', 'ejs');

//API ROUTES

app.get('/', getBooks);
app.post('/search', createSearch);
app.get('/search', newSearch);
app.get('/books/:id', getBook);
app.get('*', showError);
app.post('/books', saveBook);
app.put('/books/:id', updateBook);
app.delete('/books/:id', deleteBook);

//Helper

function Book(info) {
  this.image_url = info.volumeInfo.imageLinks ? info.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128X192';
  this.title = info.volumeInfo.title ? info.volumeInfo.title : 'No title available';
  this.author = info.volumeInfo.authors ? info.volumeInfo.authors : 'No authors available';
  this.isbn = info.volumeInfo.industryIdentifiers ? info.volumeInfo.industryIdentifiers[0].identifier : 'No ISBN available';
  this.description = info.volumeInfo.description ? info.volumeInfo.description : 'No description available';
  this.bookshelf;
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
      if( results.rowCount === 0 ){
        response.render('/pages/index');
      } else { response.render('pages/index', { books: results.rows, rowCount: results.rowCount } ) }
    })
    .catch( (error) => {
      handleError( error, response )});
}

function createSearch(request, response){
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

function getBook( request, response ){
  let SQL = `SELECT * FROM books WHERE id=${request.params.id};`;
  return client.query(SQL)
    .then( results => {
      // console.log('queried id', results);
      response.render('pages/books/show', { book: results.rows[0] });
    })
    .catch( (error) => {
      handleError( error, response )});
}

function saveBook(request , response) {
  let { title , author , isbn, image_url, description , bookshelf } = request.body;
  console.log(request.body);
  let SQL = `INSERT INTO books( title , author , isbn, image_url, description , bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;
  let values =  [title , author , isbn, image_url, description , bookshelf];
  client.query(SQL, values)
    .then(results => {
      response.redirect(`books/${results.rows[0].id}`);
    })
    .catch( (error) => {
      handleError( error, response )});
}

function updateBook(request, response) {
  let { title , author , isbn, image_url, description , bookshelf } = request.body;
  let SQL = `UPDATE books SET title=$1 , author=$2 , isbn=$3, image_url=$4 , description=$5 , bookshelf=$6 WHERE id=$7;`;
  let values =  [title , author , isbn, image_url, description , bookshelf, request.params.id];
  client.query(SQL, values)
    .then(results => {
      console.log(results);
      response.redirect(`${request.params.id}`);
    })
    .catch( (error) => {
      handleError( error, response )});
}

function deleteBook( request, response) {
  let SQL = 'DELETE FROM books WHERE id = $1;';
  let values = [ request.params.id ];
  client.query( SQL, values )
    .then( results => {
      response.redirect('/');
    }).catch(error => {
      handleError( error, response )
    });
}
//Listen
app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`)
});
