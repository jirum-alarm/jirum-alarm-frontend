const {makeMetroConfig} = require('@rnx-kit/metro-config');
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = makeMetroConfig({
  // projectRoot: __dirname,
  resolver: {
    resolveRequest: MetroSymlinksResolver(),
  },
});
