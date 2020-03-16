# GraphQL CouchDB Post/Comment Server


## Seed the CouchDB database

This command will DROP the table `article` and recreate it with the initial data.

```bash
./graphql --initialize
```

## Start the GraphQL server

The server will listen to `http://0.0.0.0:4000` by default and will connect to CouchDB at `http://admin:admin@127.0.0.1:5984`
```bash
./graphql --server
```

## Start your web browser

```
open http://localhost:4000
```

## Query GraphQL

### Auteur

```qraphql
query auteurs {
  auteurs {
    id
    sobriquet
    prenom
    nom
    creation
    articles {
      id
      titre
      text
      creation
      commentaires {
        id
        titre
        text
        pointage
        auteur {
          id
          sobriquet
          prenom
          nom
          creation
        }
      }
    }
    commentaires {
      id
      titre
      text
      pointage
    }
  }
}
```

### Article

```qraphql
query {
  articles {
    id
    titre
    text
    creation
    auteur {
      id
      sobriquet
      prenom
      nom
      creation
    }
    commentaires {
      id
      titre
      text
      pointage
      auteur {
        id
        sobriquet
        prenom
        nom
        creation
      }
    }
  }
}
```

### Commentaire

```qraphql
query {
  commentaires {
    id
    titre
    text
    pointage
    auteur {
      id
      sobriquet
      prenom
      nom
      creation
    }
  }
}
```