var Offshore = require('../../lib/offshore'),
    assert = require('assert');

describe('Offshore Collection', function() {

  describe('basic fixture', function() {
    var offshore = new Offshore(),
        Model = require('./fixtures/model.fixture'),
        User;

    before(function(done) {
      offshore.loadCollection(Model);

      var connections = {
        'my_foo': {
          adapter: 'foobar'
        }
      };

      offshore.initialize({ adapters: { foobar: {} }, connections: connections }, function(err, colls) {
        if(err) return done(err);
        User = colls.collections.test;
        done();
      });
    });

    describe('schema', function() {

      it('should create an internal schema from the attributes', function() {
        assert(typeof User._schema.schema === 'object');
        assert(Object.keys(User._schema.schema).length === 8); // account for auto created keys (pk, timestamps)
      });

      // TO-DO
      // Check all schema properties from Sails work

    });

    describe('validations', function() {

      it('should create an internal validation object from the attributes', function() {
        assert(typeof User._validator.validations === 'object');
        assert(Object.keys(User._validator.validations).length === 5);
      });

      // TO-DO
      // Validate properties using Offshore-validator with the Validator in offshore

    });

  });

  describe('custom fixtures', function() {

    describe('lowercase type', function() {
      var offshore = new Offshore(),
          User;

      before(function(done) {
        var Model = Offshore.Collection.extend({
          tableName: 'lowercaseType',
          connection: 'my_foo',
          attributes: {
            name: 'string'
          }
        });

        offshore.loadCollection(Model);

        var connections = {
          'my_foo': {
            adapter: 'foobar'
          }
        };

        offshore.initialize({ adapters: { foobar: {} }, connections: connections }, function(err, colls) {
          if(err) return done(err);
          User = colls.collections.lowercasetype;
          done();
        });
      });

      it('should set the proper schema type', function() {
        assert(User._schema.schema.name.type === 'string');
      });

      it('should set the proper validation type', function() {
        assert(User._validator.validations.name.type === 'string');
      });
    });

    describe('uppercase type', function() {
      var offshore = new Offshore(),
          User;

      before(function(done) {
        var Model = Offshore.Collection.extend({
          tableName: 'uppercaseType',
          connection: 'my_foo',
          attributes: {
            name: 'STRING'
          }
        });

        offshore.loadCollection(Model);

        var connections = {
          'my_foo': {
            adapter: 'foobar'
          }
        };

        offshore.initialize({ adapters: { foobar: {} }, connections: connections }, function(err, colls) {
          if(err) return done(err);
          User = colls.collections.uppercasetype;
          done();
        });
      });

      it('should set the proper schema', function() {
        assert(User._schema.schema.name.type === 'string');
      });

      it('should set the proper validation type', function() {
        assert(User._validator.validations.name.type === 'string');
      });
    });

  });

});
