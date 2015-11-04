var Offshore = require('../../lib/offshore'),
    adapter = require('./fixtures/adapter.special.fixture'),
    assert = require('assert');

describe('Offshore Collection', function() {
  var User;

  before(function(done) {
    var Model = Offshore.Collection.extend({
      attributes: {},
      connection: 'my_foo',
      tableName: 'tests'
    });

    var offshore = new Offshore();
    offshore.loadCollection(Model);

    var connections = {
      'my_foo': {
        adapter: 'foobar'
      }
    };

    offshore.initialize({ adapters: { foobar: adapter }, connections: connections }, function(err, colls) {
      if(err) return done(err);
      User = colls.collections.tests;
      done();
    });
  });

  describe('methods', function() {

    it('should have a foobar method', function(done) {
      assert(typeof User.foobar === 'function');

      User.foobar({}, function(err, result) {
        assert(result.status === true);
        done();
      });
    });

  });
});
