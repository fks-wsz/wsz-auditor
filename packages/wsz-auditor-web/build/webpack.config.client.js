const path = require('path');
const { merge } = require('webpack-merge');
const { baseConfig } = require('./webpack.config.base.js');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

/** @type { import('webpack').Configuration } */
module.exports = merge(baseConfig, {
  name: 'client',
  entry: {
    client: path.resolve('./client/entry-client.ts'),
  },
  output: {
    publicPath: '/client/',
    path: path.resolve('./dist/client'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
          configFile: path.resolve('./tsconfig.web.json'),
          projectReferences: true,
        },
        exclude: /node_modules/,
      },
    ],
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
