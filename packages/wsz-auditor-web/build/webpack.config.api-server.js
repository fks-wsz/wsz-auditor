const { merge } = require('webpack-merge');
const { baseConfig, ROOT_NODE_MODULES_DIR, PKG_NODE_MODULES_DIR } = require('./webpack.config.base.js');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

/** @type {import('webpack').Configuration} */
module.exports = merge(baseConfig, {
  entry: {
    'api-server': path.resolve('./server/api-server.ts'),
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js',
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
    modulesDir: ROOT_NODE_MODULES_DIR,
    additionalModuleDirs: [PKG_NODE_MODULES_DIR],
  }),
  externalsPresets: { node: true },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    }),
  ],
});
