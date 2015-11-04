var Offshore = require('../../../lib/offshore'),
    assert = require('assert');

describe('Collection Query', function() {

  describe('.destroy()', function() {

    describe('with transformed values', function() {
      var Model;

      before(function() {

        // Extend for testing purposes
        Model = Offshore.Collection.extend({
          identity: 'user',
          connection: 'foo',

          attributes: {
            name: {
              type: 'string',
              columnName: 'login'
            }
          }
        });
      });

      it('should transform values before sending to adapter', function(done) {

        var offshore = new Offshore();
        offshore.loadCollection(Model);

        // Fixture Adapter Def
        var adapterDef = {
          destroy: function(con, col, options, cb) {
            assert(options.where.login);
            return cb(null);
          }
        };

        var connections = {
          'foo': {
            adapter: 'foobar'
          }
        };

        offshore.initialize({ adapters: { foobar: adapterDef }, connections: connections }, function(err, colls) {
          if(err) return done(err);
          colls.collections.user.destroy({ name: 'foo' }, done);
        });
      });
    });

  });
});
