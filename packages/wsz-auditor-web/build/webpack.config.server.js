const { merge } = require('webpack-merge');
const { baseConfig, ROOT_NODE_MODULES_DIR, PKG_NODE_MODULES_DIR } = require('./webpack.config.base.js');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

const __DEV__ = process.env.NODE_ENV === 'development';
const VUE_CLIENT_MANIFEST_NAME = 'vue-ssr-client-manifest.json';
const VUE_SERVER_BUNDLE_NAME = 'vue-ssr-server-bundle.json';

/** @type {Array<import('webpack').Configuration>} */
module.exports = merge(baseConfig, {
  entry: {
    main: path.resolve('./server/main.ts'),
  },
  output: {
    path: path.resolve('./dist'),
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          configFile: path.resolve('./tsconfig.node.json'),
          projectReferences: true,
        },
        exclude: /node_modules/,
      },
    ],
  },
  target: 'node',
  externals: nodeExternals({
    // Point to monorepo root directory node_modules (where all hoisted dependencies are located)
    modulesDir: ROOT_NODE_MODULES_DIR,
    // Also include local node_modules (packages that are not hoisted due to version conflicts)
    additionalModuleDirs: [PKG_NODE_MODULES_DIR],
  }),
  externalsPresets: { node: true },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__,
      VUE_ENV: JSON.stringify('server'),
      VUE_CLIENT_MANIFEST_NAME: JSON.stringify(VUE_CLIENT_MANIFEST_NAME),
      VUE_SERVER_BUNDLE_NAME: JSON.stringify(VUE_SERVER_BUNDLE_NAME),
    }),
  ],
});
