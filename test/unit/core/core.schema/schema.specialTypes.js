var Offshore = require('../../../../lib/offshore'),
    assert = require('assert');

describe('Core Schema', function() {

  describe('with special types', function() {
    var person;

    before(function(done) {
      var offshore = new Offshore();

      var Person = Offshore.Collection.extend({
        identity: 'person',
        connection: 'foo',
        attributes: {
          email: 'email',
          age: 'integer'
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

    it('should transform unknown types to strings', function() {
      assert(person._schema.schema.email.type === 'string');
    });

    it('should not transform known type', function() {
      assert(person._schema.schema.age.type === 'integer');
    });
  });

});
