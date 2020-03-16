const NodeCouchDb = require('node-couchdb');
const MemcacheNode = require('node-couchdb-plugin-memcached');
 
const protocol = process.env['COUCHDB_PROTOCOL'] || 'http';
const host     = process.env['COUCHDB_HOST']     || '127.0.0.1';
const port     = process.env['COUCHDB_PORT']     || '5984';
const user     = process.env['COUCHDB_USER']     || 'admin';
const password = process.env['COUCHDB_PASSWORD'] || 'admin';

const couchExternal = new NodeCouchDb({
  host: host,
  protocol: protocol,
  port: port,
  cache: new MemcacheNode
});
 
// not admin party
const couch = new NodeCouchDb({
  auth: {
    user: user,
    pass: password
  }
});

function getAll(database, type) {
  return async function () {
    return couch
      .get(database, `_all_docs?include_docs=true&start_key="${type}:"&end_key="${type}:{}"`)
      .then(
        ({data, headers, status}) => data.rows
          .map(row => row.doc)
      );
  }
}

function get(database, type) {
  return async function (id) {
    return couch
      .get(database, id)
      .then(
        ({data, headers, status}) => {
        // data is json response
        // headers is an object with all response headers
        // status is statusCode number
        return data;
    });
  }
}

module.exports = {
  couch: couch,
  getAll: getAll,
  get: get
};