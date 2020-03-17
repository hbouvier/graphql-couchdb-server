const { couch, getAll, get } = require('./database/couchdb');

module.exports = function (database, metadata, maxdepth=5) {

  const getAuteur       = get(database, 'auteur');
  const getAuteurs      = getAll(database, 'auteur');

  const getArticle      = get(database, 'article');
  const getArticles     = getAll(database, 'article');
  const getArticlesByAuteur = async (auteurId) => (await getArticles())
    .filter(article => article.auteurId == auteurId);


  const getCommentaires = getAll(database, 'commentaire');
  const getCommentaire  = get(database, 'commentaire');
  const getCommentairesByAuteur = async (auteurId) => (await getCommentaires())
    .filter(commentaire => commentaire.auteurId == auteurId);
  const getCommentairesByArticle = async (articleId) => (await getCommentaires())
    .filter(commentaire => commentaire.articleId == articleId);



  function resolveAuteur(database, type) {  
    const allAuteurs = getAll(database, type);
    return () => allAuteurs()
      .then(auteurs => auteurs
        .map(async (auteur) => ({
          ...auteur,
          articles: (await getArticlesByAuteur(auteur.id))
            .map(async (article) => ({
              ...article,
              commentaires: (await getCommentairesByArticle(article.id))
                .map(async (commentaire) => ({
                  ...commentaire,
                  auteur: await getAuteur(commentaire.auteurId)
                }))
            })),
          commentaires: getCommentairesByAuteur(auteur.id)
        }))
      );
  }

  function resolveArticles(database, type) {
    const allArticles = getAll(database, type);
    return () => allArticles()
        .then(articles => articles
          .map(async (article) => ({
              ...article,
              auteur: await getAuteur(article.auteurId),
              commentaires: (await getCommentairesByArticle(article.id))
                .map(async (commentaire) => ({
                  ...commentaire,
                  auteur: await getAuteur(commentaire.auteurId)
                }))
          }))
        );
  }

  function resolveCommentaire(database, type) {
    const allCommentaire = getAll(database, type);
    return () => allCommentaire()
      .then(commentaires => commentaires
        .map(async (commentaire) => ({
          ...commentaire,
          auteur: await getAuteur(commentaire.auteurId)
        }))
      );
  }



  const resolvers = {
    Query: {
      auteurs: resolveAuteur(database, 'auteur'),
      articles: resolveArticles(database, 'article'),
      commentaires: resolveCommentaire(database, 'commentaire')
    }
  };

  function qraphqlSchemaLoader() {
    return couch.get(database, metadata).then(
    ({data, headers, status}) => {
        // data is json response
        // headers is an object with all response headers
        // status is statusCode number
        const typeDefs = data.schema;
        return typeDefs
    });
  }

  return {
    resolvers: resolvers,
      qraphqlSchemaLoader: qraphqlSchemaLoader
    };
}


