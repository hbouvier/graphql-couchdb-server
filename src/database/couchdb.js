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

module.exports = couch;