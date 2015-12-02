var Offshore = require('../../lib/offshore'),
    assert = require('assert');

describe('Offshore Collection', function() {

  describe('with custom column name', function() {
    var offshore = new Offshore(),
        User;

    before(function(done) {
      var Model = Offshore.Collection.extend({
        tableName: 'foo',
        connection: 'my_foo',
        attributes: {
          name: {
            type: 'string',
            columnName: 'full_name'
          }
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
        User = colls.collections.foo;
        done();
      });
    });

    it('should build a transformer object', function() {
      assert(User._transformer._transformations.name === 'full_name');
    });
  });

});
