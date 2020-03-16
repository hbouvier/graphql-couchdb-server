const { gql } = require('apollo-server');
const couch = require('../database/couchdb');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
`;

const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];


function createDB() {
	return couch.createDatabase('books');
}

function createSchema() {
	return couch.insert('books', {
    	_id: "metadata_graphql_schema",
    	schema: typeDefs
	});
}

function seedBooks() {
	return Promise.all(
		books.map( book => couch.insert('books', {
	    	_id: book.title,
	    	...book
		})
	));
}

function seed() {
	return createDB()
		.then(createSchema)
		.then(seedBooks);
}

function init() {
	return couch
		.dropDatabase('books')
		.then(seed, seed)
}

module.exports = init;
