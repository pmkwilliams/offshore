var Offshore = require('../../../../lib/offshore'),
    assert = require('assert');

describe('Core Type Casting', function() {
  describe('.run() with Array type', function() {
    var person;

    before(function(done) {
      var offshore = new Offshore();
      var Person = Offshore.Collection.extend({
        identity: 'person',
        connection: 'foo',
        attributes: {
          name: {
            type: 'array'
          }
        }
      });

      offshore.loadCollection(Person);

      var connections = {
        'foo': {
          adapter: 'foobar'
        }
      };

      offshore.initialize({ adapters: { foobar: {} }, connections: connections }, function(err, colls) {
        if(err) return done(err);
        person = colls.collections.person;
        done();
      });
    });

    it('should cast values to an array', function() {
      var values = person._cast.run({ name: 'foo' });
      assert(Array.isArray(values.name));
      assert(values.name.length === 1);
    });

  });
});
