var Offshore = require('../../../../lib/offshore'),
    assert = require('assert');

describe('Core Schema', function() {

  describe('with validation properties', function() {
    var person;

    before(function(done) {
      var offshore = new Offshore();

      var Person = Offshore.Collection.extend({
        identity: 'person',
        connection: 'foo',
        attributes: {
          first_name: {
            type: 'STRING',
            length: { min: 2, max: 10 }
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

    it('should ignore validation properties in the schema', function() {
      assert(!person._schema.schema.first_name.length);
    });
  });

});
