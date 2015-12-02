/**
 * Module dependencies
 */

var _ = require('lodash')
  , Offshore = require('../../lib/offshore');


/**
 * Set up Offshore with the specified
 * models, connections, and adapters.

  @param options
    :: {Object}   adapters     [i.e. a dictionary]
    :: {Object}   connections  [i.e. a dictionary]
    :: {Object}   collections  [i.e. a dictionary]

  @param  {Function} cb
    () {Error} err
    () ontology
      :: {Object} collections
      :: {Object} connections

  @return {Offshore}
 */

module.exports = function bootstrap( options, cb ) {

  var adapters = options.adapters || {};
  var connections = options.connections || {};
  var collections = options.collections || {};



  _(adapters).each(function (def, identity) {
    // Make sure our adapter defs have `identity` properties
    def.identity = def.identity || identity;
  });
  

  var extendedCollections = [];
  _(collections).each(function (def, identity) {

    // Make sure our collection defs have `identity` properties
    def.identity = def.identity || identity;

    // Fold object of collection definitions into an array
    // of extended Offshore collections.
    extendedCollections.push(Offshore.Collection.extend(def));
  });


  // Instantiate Offshore and load the already-extended
  // Offshore collections.
  var offshore = new Offshore();
  extendedCollections.forEach(function (collection) {
    offshore.loadCollection(collection);
  });


  // Initialize Offshore
  // (and tell it about our adapters)
  offshore.initialize({
    adapters: adapters,
    connections: connections
  }, cb);

  return offshore;
};

