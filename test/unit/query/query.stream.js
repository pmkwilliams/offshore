var Offshore = require('../../../lib/offshore'),
    assert = require('assert');

describe('Collection Query', function() {

  describe('.stream()', function() {
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

      // Fixture Adapter Def
      var adapterDef = {};

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

    it('should implement a streaming interface', function(done) {

      var stream = query.stream({});

      // Just test for error now
      stream.on('error', function(err) {
        assert(err);
        done();
      });

    });

  });
});
