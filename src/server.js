const { ApolloServer, gql }  = require('apollo-server');
const { couch, getAll, get } = require('./database/couchdb');
const listen_interface = process.env['LISTEN_INTERFACE'] || '0.0.0.0';
const listen_port      = process.env['LISTEN_PORT'] || '4000';

const database = 'article';

const getArticle      = get(database, 'article');
const getArticles     = getAll(database, 'article');

const getAuteur       = get(database, 'auteur');
const getAuteurs      = getAll(database, 'auteur');

const getCommentaire  = get(database, 'commentaire');
const getCommentaires = getAll(database, 'commentaire');



function resolveAuteur(database, type) {  
	const allAuteurs = getAll(database, type);
	return () => allAuteurs()
		.then(auteurs => auteurs
			.map(async (auteur) => { return {
				...auteur,
				articles: (await getArticles())
          .filter(article => article.auteurId == auteur.id)
          .map(async (article) => { return {
            ...article,
            commentaires: (await getCommentaires())
              .filter(commentaire => commentaire.auteurId == article.auteurId)
              .map(async (commentaire) => { return {
                ...commentaire,
                auteur: await getAuteur(commentaire.auteurId)
              }})
          }}),
				commentaires: (await getCommentaires())
          .filter(commentaire => commentaire.auteurId == auteur.id)
			}})
		);
}

function resolveArticles(database, type) {
	const allArticles = getAll(database, type);
	return () => allArticles()
			.then(articles => articles
				.map(async (article) => { return {
						...article,
						auteur: await getAuteur(article.auteurId),
						commentaires: (await getCommentaires())
              .filter(commentaire => commentaire.auteurId == article.auteurId)
              .map(async (commentaire) => { return {
                ...commentaire,
                auteur: await getAuteur(commentaire.auteurId)
              }})
				}})
			);
}

function resolveCommentaire(database, type) {
  const allCommentaire = getAll(database, type);
  return () => allCommentaire()
    .then(commentaires => commentaires
      .map(async (commentaire) => { return {
        ...commentaire,
        auteur: await getAuteur(commentaire.auteurId)
      }})
    );
}



const resolvers = {
  Query: {
    auteurs: resolveAuteur(database, 'auteur'),
    articles: resolveArticles(database, 'article'),
    commentaires: resolveCommentaire(database, 'commentaire')
  }
};

function start() {
	const typeDefs = couch.get(database, 'metadata_graphql_schema').then(
		({data, headers, status}) => {
		    // data is json response
		    // headers is an object with all response headers
		    // status is statusCode number
		    const typeDefs = data.schema;
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