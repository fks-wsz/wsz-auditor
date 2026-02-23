const { merge } = require('webpack-merge');
const { baseConfig, ROOT_NODE_MODULES_DIR, PKG_NODE_MODULES_DIR } = require('./webpack.config.base.js');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

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
    // 指向 monorepo 根目录的 node_modules（所有 hoisted 依赖所在位置）
    modulesDir: ROOT_NODE_MODULES_DIR,
    // 同时包含本地 node_modules（存放因版本冲突未被 hoist 的包）
    additionalModuleDirs: [PKG_NODE_MODULES_DIR],
  }),
  externalsPresets: { node: true },
  plugins: [
    new webpack.DefinePlugin({
      VUE_ENV: JSON.stringify('server'),
      VUE_CLIENT_MANIFEST_NAME: JSON.stringify(VUE_CLIENT_MANIFEST_NAME),
      VUE_SERVER_BUNDLE_NAME: JSON.stringify(VUE_SERVER_BUNDLE_NAME),
    }),
  ],
});
