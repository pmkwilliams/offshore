var Offshore = require('../../../lib/offshore'),
    assert = require('assert');

describe('.afterValidate()', function() {

  describe('basic function', function() {
    var person;

    before(function(done) {
      var offshore = new Offshore();
      var Model = Offshore.Collection.extend({
        identity: 'user',
        connection: 'foo',
        attributes: {
          name: 'string'
        },

        afterValidate: function(values, cb) {
          values.name = values.name + ' updated';
          cb();
        }
      });

      offshore.loadCollection(Model);

      // Fixture Adapter Def
      var adapterDef = { create: function(con, col, values, cb) { return cb(null, values); }};

      var connections = {
        'foo': {
          adapter: 'foobar'
        }
      };

      offshore.initialize({ adapters: { foobar: adapterDef }, connections: connections }, function(err, colls) {
        if(err) done(err);
        person = colls.collections.user;
        done();
      });
    });

    /**
     * Create
     */

    describe('.create()', function() {

      it('should run afterValidate and mutate values', function(done) {
        person.create({ name: 'test' }, function(err, user) {
          assert(!err);
          assert(user.name === 'test updated');
          done();
        });
      });
    });
  });


  /**
   * Test Callbacks can be defined as arrays and run in order.
   */

  describe('array of functions', function() {
    var person;

    before(function(done) {
      var offshore = new Offshore();
      var Model = Offshore.Collection.extend({
        identity: 'user',
        connection: 'foo',
        attributes: {
          name: 'string'
        },

        afterValidate: [
          // Function 1
          function(values, cb) {
            values.name = values.name + ' fn1';
            cb();
          },

          // Function 1
          function(values, cb) {
            values.name = values.name + ' fn2';
            cb();
          }
        ]
      });

      offshore.loadCollection(Model);

      // Fixture Adapter Def
      var adapterDef = { create: function(con, col, values, cb) { return cb(null, values); }};

      var connections = {
        'foo': {
          adapter: 'foobar'
        }
      };

      offshore.initialize({ adapters: { foobar: adapterDef }, connections: connections }, function(err, colls) {
        if(err) done(err);
        person = colls.collections.user;
        done();
      });
    });

    it('should run the functions in order', function(done) {
      person.create({ name: 'test' }, function(err, user) {
        assert(!err);
        assert(user.name === 'test fn1 fn2');
        done();
      });
    });
  });

});
