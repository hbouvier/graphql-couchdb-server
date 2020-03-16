const { ApolloServer, gql } = require('apollo-server');
const couch = require('./database/couchdb');
const listen_interface = process.env['LISTEN_INTERFACE'] || '0.0.0.0';
const listen_port      = process.env['LISTEN_PORT'] || '4000';

console.log(JSON.parse)
async function books() {
	return couch
		.get('books', '_all_docs?include_docs=true')
		.then(
			({data, headers, status}) => data.rows
				.filter(r => !(r.id.startsWith('metadata_') || r.id.startsWith('_')))
				.map(book => {
					return {
						title:  book.doc.title,
						author: book.doc.title
					};
				})
		, err => console.log('shit, no books', err)
		);
}


const resolvers = {
  Query: {
    books: books,
  },
};

function start() {
	const typeDefs = couch.get('books', 'metadata_graphql_schema').then(
		({data, headers, status}) => {
		    // data is json response
		    // headers is an object with all response headers
		    // status is statusCode number
		    const typeDefs = data.schema;
		    console.log(typeDefs);
			const server = new ApolloServer({ typeDefs, resolvers });

			// The `listen` method launches a web server.
			server.listen(listen_port, listen_interface).then(({ url }) => {
			  console.log(`🚀  Server ready at ${url}`);
			});


		}, err => {
			console.log(err);
		    // either request error occured
		    // ...or err.code=EDOCMISSING if document is missing
		    // ...or err.code=EUNKNOWN if statusCode is unexpected
		});

	// The ApolloServer constructor requires two parameters: your schema
	// definition and your set of resolvers.

}

module.exports = start;