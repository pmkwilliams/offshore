var Offshore = require('../../../lib/offshore');
var assert = require('assert');

describe('Transaction', function() {
  var query;
  var trx = 'Trx-1';

  before(function(done) {

    var offshore = new Offshore();
    var Model = Offshore.Collection.extend({
      identity: 'user',
      connection: 'foo',
      attributes: {
        name: {
          type: 'string',
          defaultsTo: 'Foo Bar'
        }
      }
    });

    offshore.loadCollection(Model);

    // Fixture Adapter Def
    var adapterDef = {
      registerConnection: function(con, col, cb) {
        return cb();
      },
      registerTransaction: function(con, col, cb) {
        return cb(null, trx);
      },
      commit: function(con, col, cb) {
        if (con !== trx) {
          return cb(new Error());
        }
        trx = 'commit';
        cb();
      },
      rollback: function(con, col, cb) {
        if (con !== trx) {
          return cb(new Error());
        }        
        trx = 'rollback';
        cb(new Error());
      },
      create: function(con, col, values, cb) {
        if (con !== trx) {
          return cb(new Error());
        }
        return cb();
      }
    };

    var connections = {
      'foo': {
        adapter: 'foobar'
      }
    };

    offshore.initialize({adapters: {foobar: adapterDef}, connections: connections}, function(err, colls) {
      if (err)
        return done(err);
      query = colls.collections.user;
      done();
    });
  });

  it('should commit', function(done) {
    Offshore.Transaction(query, function(trx1, cb) {
      assert(trx1.user, 'Should insert collection in transaction');
      assert(trx1.user._query);
      assert(!query._query, 'Should not alter context collection');

      trx1.user.create({}, function(err) {
        if (err) {
          return done('Create should receive transactionName instead of connectionName');
        }
        cb(null, 'ok');
      });
    }).exec(function(err, result) {
      if (err) {
        return done(err);
      }
      assert.equal(trx, 'commit', 'Should commit');
      assert.equal(result, 'ok', 'Should pass data in exec callback');
      done();
    });
  });

  it('should rollback', function(done) {
    Offshore.Transaction(query, function(trx1, cb) {
      assert(trx1.user, 'Should insert collection in transaction');
      assert(trx1.user._query);
      assert(!query._query, 'Should not alter context collection');

      trx1.user.create({}, function(err) {
        if (err) {
          return done('Create should receive transactionName instead of connectionName');
        }
        cb('not ok');
      });
    }).exec(function(err, result) {
      assert.equal(err, 'not ok', 'Should pass rollback error in exec callback'); 
      assert.equal(trx, 'rollback', 'Should rollback');
      done();
    });
  });

});
