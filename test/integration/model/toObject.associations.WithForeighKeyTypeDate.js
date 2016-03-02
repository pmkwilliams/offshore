var Offshore = require('../../../lib/offshore');
var assert = require('assert');

describe('Model', function() {
  describe('.toObject() with associations with foreign key typed as datetime', function() {
    var offshore;
    var Schedule;

    before(function(done) {
      offshore = new Offshore();
      var collections = {};

      collections.trucker = Offshore.Collection.extend({
        identity: 'Trucker',
        connection: 'foo',
        tableName: 'trucker_table',
        attributes: {
          truckerName: {
            type: 'string'
          },
          workdays: {
            collection: 'Workday',
            via: 'trucker',
            through: 'schedule'
          }
        }
      });

      collections.workday = Offshore.Collection.extend({
        identity: 'Workday',
        connection: 'foo',
        tableName: 'workday_table',
        attributes: {
          id: {
            type: 'datetime',
            primaryKey: true
          },
          start: {
            type: 'datetime',
            defaultsTo: new Date(1970, 0, 1, 12, 0)
          },
          end: {
            type: 'datetime',
            defaultsTo: new Date(1970, 0, 1, 16, 0, 0)
          },
          trucker: {
            collection: 'Trucker',
            via: 'workday',
            through: 'schedule'
          }
        }
      });

      collections.schedule = Offshore.Collection.extend({
        identity: 'Schedule',
        connection: 'foo',
        tableName: 'schedule_table',
        attributes: {
          miles: {
            type: 'integer'
          },
          trucker: {
            model: 'Trucker',
            foreignKey: true,
            columnName: 'trucker_id'
          },
          workday: {
            model: 'Workday',
            type: 'datetime',
            foreignKey: true,
            columnName: 'workday_id'
          }
        }
      });

      offshore.loadCollection(collections.trucker);
      offshore.loadCollection(collections.workday);
      offshore.loadCollection(collections.schedule);

      var connections = {
        'foo': {
          adapter: 'foobar'
        }
      };

      offshore.initialize({ adapters: { foobar: {} }, connections: connections }, function(err, colls) {
        if (err) { done(err); }
        Schedule = colls.collections.schedule;
        done();
      });
    });

    it('should return a valid object with ids for foreign key fields', function() {
      var schedule = new Schedule._model({ trucker: 1, workday: new Date(1970, 0, 1, 0, 0), miles: 10 });
      var obj = schedule.toObject();
      assert(obj.trucker === 1);
      assert((new Date(obj.workday)).getTime() === (new Date(1970, 0, 1, 0, 0)).getTime());
      assert(obj.miles === 10);
    });
  });
});
