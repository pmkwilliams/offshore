var Collection = require('../../../../lib/offshore/collection');

// Extend for testing purposes
var Model = Collection.extend({
  identity: 'user',
  adapter: 'test',

  attributes: {

    // deals: {
    //   collection: 'Deal'
    // },

    payments: {
      collection: 'Payment'
    },

    name: 'string'

  }
});

module.exports = Model;
