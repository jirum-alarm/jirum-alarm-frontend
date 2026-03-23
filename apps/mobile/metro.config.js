const path = require('node:path');
const {getDefaultConfig} = require('expo/metro-config');
const {withNativeWind} = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: './global.css',
  configPath: path.join(__dirname, 'tailwind.config.js'),
});
