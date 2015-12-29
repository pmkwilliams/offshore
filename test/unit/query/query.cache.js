var Offshore = require('../../../lib/offshore'),
    assert = require('assert');

describe('Collection Query', function() {

  describe('.cache()', function() {
    var query;

    before(function(done) {

      var offshore = new Offshore();
      var Model = Offshore.Collection.extend({
        identity: 'user',
        connection: 'foo',
        attributes: {
          name: {
            type: 'string',
            defaultsTo: 'Foo Bar'
          },
          doSomething: function() {}
        }
      });

      offshore.loadCollection(Model);

      var first = true;
      // Fixture Adapter Def
      var adapterDef = { 
        find: function(con, col, criteria, cb) {
          if (!first) {
            return cb(new Error('should not call adapter.find a second time'));
          }
          first = false;
          return cb(null, [{name: 'should be cached'}]);
        }
      };

      var connections = {
        'foo': {
          adapter: 'foobar'
        }
      };

      offshore.initialize({ adapters: { foobar: adapterDef }, connections: connections }, function(err, colls) {
        if(err) return done(err);
        query = colls.collections.user;
        done();
      });
    });

    it('should cache results', function(done) {
      query.find({}).cache('cache_test',10).exec(function(err, first_values) {
        assert(!err);
        query.find({}).cache('cache_test',10).exec(function(err, cached_values) {
          assert(!err);
          assert(first_values[0].name === cached_values[0].name);
          done();
        });
      });
    });

  });
});
