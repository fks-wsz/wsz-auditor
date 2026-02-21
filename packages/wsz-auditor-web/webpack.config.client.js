const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

module.exports = function (env) {
  return merge(baseConfig(env), {
    name: 'client',
    entry: {
      client: './client/entry-client.ts',
    },
    output: {
      publicPath: '/client/',
      path: path.resolve('./dist/client'),
    },
    optimization: {
      runtimeChunk: {
        name: 'webpack-manifest',
      },
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vue: {
            test: /[\\/]node_modules[\\/]vue(.*)[\\/]/,
            name: 'vue',
            priority: 20,
          },
        },
      },
    },
    plugins: [new VueSSRClientPlugin({})],
  });
};
