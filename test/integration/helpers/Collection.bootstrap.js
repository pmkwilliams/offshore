/**
 * Module Dependencies
 */
var Offshore = require('../../../lib/offshore');
var _ = require('lodash');

/**
 * @option {Adapter} adapter
 * @return {Function}      helper method to bootstrap a collection using the specified adapter
 */
module.exports = function (options) {

  /**
   * @param  {Function} done [description]
   */
  return function(done) {
    var self = this;

    var adapterIdentity = 'barbaz';
    options.adapter.identity = adapterIdentity;

    var Model = Offshore.Collection.extend(
      _.merge({
        attributes: {},
        connection: 'my_foo',
        tableName: 'tests',
        schema: false
      }, options.properties || {})
    );

    var offshore = new Offshore();
    offshore.loadCollection(Model);

    var connections = {
      'my_foo': {
        adapter: adapterIdentity
      }
    };

    offshore.initialize({ adapters: { barbaz: options.adapter }, connections: connections }, function(err, ocean) {
      if (err) return done(err);
      
      // Save access to all collections + connections
      self.ocean = ocean;

      // expose global?
      SomeCollection = ocean.collections.tests;
      self.SomeCollection = SomeCollection;
      done();
    });
  };
};
