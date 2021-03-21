'use strict';

/* This script updates env.js with deployment environment variables. Allows keycloak off/on and changing mapbox tokens */

const replace = require('replace');

doReplace('url', process.env.AUTH_URL);
doReplace('enabled', process.env.KEYCLOAK);
doReplace('realm', process.env.REALM);
doReplace('clientId', process.env.CLIENTID);
doReplace('accessToken', process.env.TOKEN);
doReplace('simulationDistanceBase', process.env.SIMULATION_DISTANCE_BASE || '750');
doReplace('simulationDistanceVariation', process.env.SIMULATION_DISTANCE_BASE || '0.2');
doReplace('simulationDelay', process.env.SIMULATION_DELAY || '5000');

function doReplace(key, value) {
  const regex = key + ' = \'.*\'';
  const replacement = key + ' = \''+ value +'\'';

  replace({
    regex: regex,
    replacement: replacement,
    paths: [`${__dirname}/dist/client/build/assets/js/env.js`]
  });
}
