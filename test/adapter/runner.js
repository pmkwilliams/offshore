/**
 * Test runner dependencies
 */
var util = require('util');
var mocha = require('mocha');

var adapterName = 'offshore-memory';
var TestRunner = require('offshore-adapter-tests');
var Adapter = require(adapterName);



// Grab targeted interfaces from this adapter's `package.json` file:
var package = {};
var interfaces = [];
var features = [];
try {
    package = require('../../node_modules/' + adapterName + '/package.json');
    interfaces = package['offshoreAdapter'].interfaces;
    features = package.offshoreAdapter.features;
}
catch (e) {
    throw new Error(
    '\n'+
    'Could not read supported interfaces from "offshore-adapter"."interfaces"'+'\n' +
    'in this adapter\'s `package.json` file ::' + '\n' +
    util.inspect(e)
    );
}





console.info('Testing `' + package.name + '`, a Sails adapter.');
console.info('Running `offshore-adapter-tests` against ' + interfaces.length + ' interfaces...');
console.info('( ' + interfaces.join(', ') + ' )');
console.log();




/**
 * Integration Test Runner
 *
 * Uses the `offshore-adapter-tests` module to
 * run mocha tests against the specified interfaces
 * of the currently-implemented Offshore adapter API.
 */
new TestRunner({

    // Load the adapter module.
    adapter: Adapter,

    // Default adapter config to use.
    config: {
        schema: false
    },

    // The set of adapter interfaces to test against.
    // (grabbed these from this adapter's package.json file above)
    interfaces: interfaces,
  
    // The set of adapter features to test against.
    // (grabbed these from this adapter's package.json file above)
    features: features,
    
    // Mocha options
    // reference: https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
    mocha: {
      reporter: 'spec'
    },
    
    mochaChainableMethods: {},
    
    // Return code 1 if any test failed
    failOnError: true
    
    // Most databases implement 'semantic' and 'queryable'.
    // 
    // As of Sails/Offshore v0.10, the 'associations' interface
    // is also available.  If you don't implement 'associations',
    // it will be polyfilled for you by Offshore core.  The core
    // implementation will always be used for cross-adapter / cross-connection
    // joins.
    // 
    // In future versions of Offshore, 'queryable' may be also
    // be polyfilled by core.
    // 
    // These polyfilled implementations can usually be further optimized at the
    // adapter level, since most databases provide optimizations for internal
    // operations.
});
