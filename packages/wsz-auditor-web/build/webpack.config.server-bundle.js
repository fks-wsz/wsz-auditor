const path = require('path');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const { merge } = require('webpack-merge');
const { baseConfig, ROOT_NODE_MODULES_DIR, PKG_NODE_MODULES_DIR } = require('./webpack.config.base.js');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

/** @type {import('webpack').Configuration} */
module.exports = merge(baseConfig, {
  name: 'server-bundle',
  entry: {
    server: path.resolve('./server/entry-server.ts'),
  },
  output: {
    path: path.resolve('./dist/server-bundle'),
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
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
      VUE_ENV: JSON.stringify('server'),
    }),
    new VueSSRServerPlugin({
      filename: 'vue-ssr-server-bundle.json',
    }),
  ],
});
