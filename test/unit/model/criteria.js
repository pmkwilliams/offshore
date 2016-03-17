var Offshore = require('../../../lib/offshore');
var assert = require('assert');
var async = require('async');

var offshore = new Offshore();
var migrate = 'drop';

describe('criteria', function() {
  var AnimalModel, PersonModel, CloverModel;
  before(function(done) {

    var Person = Offshore.Collection.extend({
      identity: 'Person',
      connection: 'assoc_criterias',
      tableName: 'person_table',
      migrate: migrate,
      attributes: {
        "id": {
          "type": "integer",
          "primaryKey": true
        },
        "name": {
          "type": "string"
        },
        sheeps: {
          "collection": "Animal",
          "via": "person",
          criteria: {
            legsCount: 4
          }
        }
      }
    });

    var Animal = Offshore.Collection.extend({
      identity: 'Animal',
      connection: 'assoc_criterias',
      tableName: 'animal_table',
      migrate: migrate,
      attributes: {
        "id": {
          "type": "integer",
          "primaryKey": true
        },
        "color": {
          "type": "string"
        },
        "legsCount": {
          "type": "integer"
        },
        person: {
          "model": "person"
        },
        age: {
          "type": "integer"
        }
      }
    });


    var Clover = Offshore.Collection.extend({
      identity: 'Clover',
      connection: 'assoc_criterias',
      tableName: 'clover_table',
      migrate: migrate,
      criteria: {
        "leafCount": 3
      },
      attributes: {
        "id": {
          "type": "integer",
          "primaryKey": true
        },
        "name": {
          "type": "string"
        },
        leafCount: {
          "type": "integer"
        }
      }
    });

    offshore.loadCollection(Animal);
    offshore.loadCollection(Person);
    offshore.loadCollection(Clover);

    var connections = {'assoc_criterias': {
        adapter: 'adapter'}
    };

    offshore.initialize({adapters: {adapter: require('offshore-memory')}, connections: connections}, function(err, colls) {
      if (err) {
        return done(err);
      }
      PersonModel = colls.collections.person;
      AnimalModel = colls.collections.animal;
      CloverModel = colls.collections.clover;
      done();
    });
  });

  it('should error if invalid association doesn\'t match model\'s association criteria', function(done) {
    var marySheeps = [
      {id: 1, color: 'White', legsCount: 4, age: 2},
      {id: 2, color: 'Black', legsCount: 3, age: 1}
    ];

    PersonModel.create({id: 1, name: 'Mary', sheeps: marySheeps}, function(err) {
      assert(err);
      done();
    });
  });

  it('should error if invalid value doesn\'t match model\'s criteria', function(done) {
    CloverModel.create({id: 1, clovertName: 'clover', leafCount: 4}).exec(function(err) {
      assert(err);
      done();
    });
  });

  it('should populate association matching model\'s association and query criterias', function(done) {
    var animals = [
      {id: 5, color: 'Black', legsCount: 3, age: 0, person: 3},
      {id: 6, color: 'Cyan', legsCount: 4, age: 2, person: 3},
      {id: 7, color: 'Black', legsCount: 4, age: 1, person: 3}
    ];

    AnimalModel.createEach(animals, function(err) {
      if (err) {
        return done(err);
      }
      PersonModel.create({id: 3, name: 'Samir'}).exec(function(err) {
        if (err) {
          return done(err);
        }
        PersonModel.findOne(3).populate('sheeps', {where: {color: 'Black', age: {'<': 2}}}).exec(function(err, person) {
            if (err) {
              return done(err);
            }
            assert(person.sheeps.length === 1);
            assert(person.sheeps[0].color === 'Black');
            assert(person.sheeps[0].age === 1);
            assert(person.sheeps[0].legsCount === 4);
            done();
          });
      });
    });
  });

  it('should set model\'s criteria\'s defaults values when the value is undefined', function(done) {
    CloverModel.create({id: 2}).exec(function(err, clover) {
      assert.ifError(err);
      assert(clover.leafCount === 3);
      done();
    });
  });

  it('should set association\'s criteria\'s defaults values when the value is undefined', function(done) {
    var sheeps = [
      {id: 8, color: 'Red', age: 2},
      {id: 9, color: 'Blue', age: 3}
    ];

    PersonModel.create({id: 4, name: 'Jacques', sheeps: sheeps}, function(err) {
      assert.ifError(err);
      PersonModel.findOne(4).populate('sheeps').exec(function(err, person) {
        assert.ifError(err);
        assert(person.sheeps.length === 2);
        assert(person.sheeps[0].legsCount === 4);
        assert(person.sheeps[1].legsCount === 4);
      });
      done();
    });
  });

});
