/** @import {Configuration} from 'webpack' */
const { VueLoaderPlugin } = require('vue-loader');
const path = require('path');
const Webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsWebpackPlugin = require('tsconfig-paths-webpack-plugin');

const __DEV__ = process.env.NODE_ENV !== 'production';

exports.ROOT_NODE_MODULES_DIR = path.resolve('../../node_modules');
exports.PKG_NODE_MODULES_DIR = path.resolve('./node_modules');

/**
 * @type { Configuration }
 */
exports.baseConfig = {
  mode: __DEV__ ? 'development' : 'production',
  stats: 'minimal',
  output: {
    devtoolModuleFilenameTemplate: (info) => {
      // Normalize paths to forward slashes, remove webpack prefix
      return `file:///${info.absoluteResourcePath.replace(/\\/g, '/')}`;
    },
  },
  module: {
    rules: [
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
    plugins: [
      new TsconfigPathsWebpackPlugin({
        configFile: path.resolve('./tsconfig.web.json'),
      }),
    ],
  },
  plugins: [new VueLoaderPlugin(), new MiniCssExtractPlugin()],
  ...(__DEV__ ? { devtool: 'source-map' } : {}),
};
