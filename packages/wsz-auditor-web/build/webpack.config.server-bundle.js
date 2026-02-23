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
    // 指向 monorepo 根目录的 node_modules（所有 hoisted 依赖所在位置）
    modulesDir: ROOT_NODE_MODULES_DIR,
    // 同时包含本地 node_modules（存放因版本冲突未被 hoist 的包）
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
