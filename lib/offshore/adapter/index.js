/**
 * Base Adapter Definition
 */

var _ = require('lodash');

var Adapter = module.exports = function(options) {

  // Ensure the connections are set
  this.connections = options.connections || {};

  // Ensure the dictionary is built
  this.dictionary = options.dictionary || {};

  // Set a Query instance to get access to top
  // level query functions
  this.query = options.query || {};
  this._query = options._query || {};

  // Set Collection Name
  this.collection = options.collection || '';

  // Set Model Identity
  this.identity = options.identity || '';

  return this;
};

Adapter.prototype.loadQuery = function(query) {
    if(!query) {
        return this;
    }
    this._query = query;
    return this;
};

_.extend(
  Adapter.prototype,
  require('./dql'),
  require('./ddl'),
  require('./compoundQueries'),
  require('./aggregateQueries'),
  require('./setupTeardown'),
  require('./sync'),
  require('./stream')
);
