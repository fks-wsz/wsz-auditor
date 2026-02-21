const path = require('path');
const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');

/** @returns {Array<import('webpack').Configuration>} */
module.exports = function (env) {
  return [
    merge(baseConfig(env), {
      name: 'server',
      entry: {
        server: './server/entry-server.ts',
      },
      output: {
        path: path.resolve('./dist/server'),
        libraryTarget: 'commonjs2',
      },
      target: 'node',
      externalsPresets: { node: true },
      externals: nodeExternals({
        allowlist: [/\.css$/],
      }),
      plugins: [
        new VueSSRServerPlugin({
          filename: 'vue-ssr-server-bundle.json',
        }),
      ],
    }),
    merge(baseConfig(env), {
      dependencies: ['server'],
      entry: {
        main: './server/main.ts',
      },
      output: {
        path: path.resolve('./dist'),
        libraryTarget: 'commonjs2',
      },
      target: 'node',
      externals: nodeExternals(),
      externalsPresets: { node: true },
    }),
  ];
};
