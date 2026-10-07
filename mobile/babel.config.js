module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            // Map the pnpm workspace package name to our bundled local copy
            '@workspace/api-client-react': './src/api-client/index.ts',
            // @ alias for expo-router / tsconfig paths
            '@': './',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      // react-native-reanimated plugin must be last in SDK 57+
      'react-native-reanimated/plugin',
    ],
  };
};
