/** @import {Configuration} from 'webpack' */
const { VueLoaderPlugin } = require('vue-loader');
const path = require('path');
const Webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const __DEV__ = process.env.NODE_ENV !== 'production';
const VUE_SERVER_BUNDLE_NAME = 'vue-ssr-server-bundle.json';
const VUE_CLIENT_MANIFEST_NAME = 'vue-ssr-client-manifest.json';

/**
 * @return { Configuration }
 */
module.exports = function (env) {
  const tsConfigFile =
    env?.VUE_ENV === 'server'
      ? path.resolve(__dirname, 'tsconfig.node.json')
      : path.resolve(__dirname, 'tsconfig.json');

  return {
    mode: __DEV__ ? 'development' : 'production',
    stats: 'minimal',
    output: {
      publicPath: '/',
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
            configFile: tsConfigFile,
          },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        {
          test: /\.vue$/,
          use: 'vue-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
    },
    plugins: [
      new VueLoaderPlugin(),
      new Webpack.DefinePlugin({
        __DEV__,
        __SSR_SERVER_BUNDLE__: JSON.stringify(path.join('./dist/server/', VUE_SERVER_BUNDLE_NAME)),
        __SSR_CLIENT_MANIFEST__: JSON.stringify(path.join('./dist/client', VUE_CLIENT_MANIFEST_NAME)),
        __VUE_ENV__: JSON.stringify(env.VUE_ENV),
      }),
      new MiniCssExtractPlugin(),
    ],
    ...(__DEV__ ? { devtool: 'source-map' } : {}),
  };
};
