var Offshore = require('../../../../lib/offshore'),
    assert = require('assert');

describe('Core Schema', function() {

  describe('with instance methods', function() {
    var person;

    before(function(done) {
      var offshore = new Offshore();

      var Person = Offshore.Collection.extend({
        identity: 'person',
        connection: 'foo',
        attributes: {
          first_name: 'string',
          doSomething: function() {}
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

    it('should ignore instance methods in the schema', function() {
      assert(!person._schema.schema.doSomething);
    });
  });

});
