const { gql   } = require('apollo-server');
const { couch } = require('../database/couchdb');

const database = 'article';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  type Auteur {
  	id: ID!
  	sobriquet: String!
  	prenom: String
  	nom: String
    creation: String!
    modification: String
    suppression: String
    articles: [Article]
    commentaires: [Commentaire]
  }

  type Article {
  	id: ID!
    titre: String!
    text: String!
    creation: String!
    modification: String
    suppression: String
    auteur: Auteur!
    commentaires: [Commentaire]
  }

  type Commentaire {
  	id: ID!
    titre: String!
    text: String!
    auteur: Auteur!
    article: Article!
    pointage: Int
    creation: String!
    modification: String
    suppression: String
  }

  type Query {
    auteurs: [Auteur]
    articles: [Article]
    commentaires: [Commentaire]
  }
`;

const Auteur = [
  {
  	type: 'auteur',
  	id: "auteur:1",
  	sobriquet: "beeker",
  	prenom: "Henri",
  	nom: "Bouvier",
    creation: "2020/03/16"
  },
  {
  	type: 'auteur',
  	id: "auteur:2",
  	sobriquet: "potus",
  	prenom: "Donald",
  	nom: "Trump",
    creation: "2020/03/16"
  },
];

const Article = [
  {
  	type: 'article',
  	id: "article:1",
    titre: "GraphQL - CouchDB",
    text: "Une implementation de GrpahQL sur CouchDB 3.0",
    auteurId: "auteur:1",
    creation: "2020/03/16"
  },
  {
  	type: 'article',
  	id: "article:2",
    titre: "CouchDB",
    text: "Base de donnes NoSQL",
    auteurId: "auteur:1",
    creation: "2020/03/16"
  },
  {
  	type: 'article',
  	id: "article:3",
    titre: "Fake news",
    text: "What else could I post?",
    auteurId: "auteur:2",
    creation: "2020/03/16"
  },
];
const Commentaire = [
  {
  	type: 'commentaire',
  	id: "commentaire:1",
    titre: "Interessant",
    text: "Merci pour un article interessant",
    auteurId: "auteur:2",
    articleId: "article:1",
    pointage: 5,
    creation: "2020/03/16"
  },
  {
  	type: 'commentaire',
  	id: "commentaire:2",
    titre: "Belle decouverte",
    text: "Je n'avais jamais entendu parle",
    auteurId: "auteur:1",
    articleId: "article:1",
    pointage: 5,
    creation: "2020/03/16"
  },
  {
  	type: 'commentaire',
  	id: "commentaire:3",
    titre: "Wow!",
    text: "Est-ce possible",
    auteurId: "auteur:1",
    articleId: "article:2",
    pointage: 1,
    creation: "2020/03/16"
  },
];

const AllDocuments = [].concat(Auteur, Article, Commentaire);

function createDB() {
	return couch.createDatabase(database);
}

function createSchema() {
	return couch.insert(database, {
    	_id: "metadata_graphql_schema",
    	schema: typeDefs
	});
}

function seedDatabase() {
	return Promise.all(
		AllDocuments.map( doc => couch.insert(database, { _id: `${doc.id}`, ...doc})
	));
}

function seed() {
	return createDB()
		.then(createSchema)
		.then(seedDatabase);
}

function init() {
	return couch
		.dropDatabase(database)
		.then(seed, seed)
}

module.exports = init;
