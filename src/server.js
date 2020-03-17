const { ApolloServer, gql }  = require('apollo-server');
const listen_interface = process.env['LISTEN_INTERFACE'] || '0.0.0.0';
const listen_port      = process.env['LISTEN_PORT'] || '4000';

const database = 'article';
const metadata = 'metadata_graphql_schema';
const { qraphqlSchemaLoader, resolvers } = require('./resolver')(database, metadata);

function start() {
	const typeDefs = qraphqlSchemaLoader().then(
		(schema) => {
		  const typeDefs = schema;
			const server = new ApolloServer({ typeDefs, resolvers });

			// The `listen` method launches a web server.
			server.listen(listen_port, listen_interface).then(({ url }) => {
			  console.log(`🚀  Server ready at ${url}`);
			});
		}, err => {
      // err.code=EDOCMISSING if document is missing
      // err.code=EUNKNOWN if statusCode is unexpected
			console.log(err);
		});
}

module.exports = start;