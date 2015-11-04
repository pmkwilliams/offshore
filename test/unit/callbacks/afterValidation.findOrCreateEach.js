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
      var adapterDef = {
        find: function(con, col, criteria, cb) { return cb(null, null); },
        create: function(con, col, values, cb) { return cb(null, values); }
      };

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
     * findOrCreateEach
     */

    describe('.findOrCreateEach()', function() {

      it('should run afterValidate and mutate values', function(done) {
        person.findOrCreateEach([{ name: 'test' }], [{ name: 'test' }], function(err, users) {
          assert(!err);
          assert(users[0].name === 'test updated');
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
      var adapterDef = {
        find: function(con, col, criteria, cb) { return cb(null, null); },
        create: function(con, col, values, cb) { return cb(null, values); }
      };

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
      person.findOrCreateEach([{ name: 'test' }], [{ name: 'test' }], function(err, users) {
        assert(!err);
        assert(users[0].name === 'test fn1 fn2');
        done();
      });
    });
  });

});
