/**
 * Module dependencies
 */

var setupOffshore = require('./bootstrap');




/**
 * Do stuff.
 */

setupOffshore({
  adapters: {
    'sails-disk': require('sails-disk')
  },
  collections: {
    user: {
      connection: 'tmp',
      attributes: {}
    }
  },
  connections: {
    tmp: {
      adapter: 'sails-disk'
    }
  }
}, function offshoreReady (err, ontology) {
  if (err) throw err;

  // Our collections (i.e. models):
  ontology.collections;

  // Our connections (i.e. databases):
  ontology.connections;

});

