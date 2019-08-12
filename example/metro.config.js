/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require('path');
const blacklist = require('metro-config/src/defaults/blacklist');

module.exports = {
  projectRoot: __dirname,
  resolver: {
    blacklistRE: blacklist([
      new RegExp(
        `^${escape(path.resolve(__dirname, '..', 'node_modules'))}\/.*$`,
      ),
    ]),
    providesModuleNodeModules: [
      'react',
      'react-native',
      'react-native-svg',
      'prop-types',
      'xmldom',
      '@babel/runtime',
    ],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  watchFolders: [path.resolve(__dirname, '..')],
};
