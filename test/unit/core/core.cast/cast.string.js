var Offshore = require('../../../../lib/offshore'),
    assert = require('assert');

describe('Core Type Casting', function() {
  describe('.run() with String type', function() {
    var person;

    before(function(done) {
      var offshore = new Offshore();
      var Person = Offshore.Collection.extend({
        identity: 'person',
        connection: 'foo',
        attributes: {
          name: {
            type: 'string'
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

    it('should cast numbers to strings', function() {
      var values = person._cast.run({ name: 27 });

      assert(typeof values.name === 'string');
      assert(values.name === '27');
    });

  });
});
