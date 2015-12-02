var Offshore = require('../../lib/offshore'),
    assert = require('assert');

describe('Offshore Collection', function() {

  describe('normalizing tableName to identity', function() {
    var offshore = new Offshore(),
        User;

    before(function(done) {
      var Model = Offshore.Collection.extend({
        tableName: 'foo',
        connection: 'my_foo',
        attributes: {
          name: 'string'
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

    it('should have identity set', function() {
      assert(User.identity === 'foo');
    });
  });

  describe('with identity and tableName', function() {
    var offshore = new Offshore(),
        User;

    before(function(done) {
      var Model = Offshore.Collection.extend({
        identity: 'foobar',
        tableName: 'foo',
        connection: 'my_foo',
        attributes: {
          name: 'string'
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
        User = colls.collections.foobar;
        done();
      });
    });

    it('should have identity set', function() {
      assert(User.identity === 'foobar');
      assert(User.tableName === 'foo');
    });
  });

});
