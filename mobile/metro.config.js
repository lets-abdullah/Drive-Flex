const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve @workspace/api-client-react to local bundled copy
config.resolver.alias = {
  '@workspace/api-client-react': path.resolve(__dirname, 'src/api-client/index.ts'),
};

module.exports = config;
