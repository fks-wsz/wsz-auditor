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
      // 将路径统一为正斜杠，去掉 webpack 添加的前缀
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
  },
  plugins: [
    new TsconfigPathsWebpackPlugin({
      configFile: path.resolve('./tsconfig.web.json'),
    }),
    new VueLoaderPlugin(),
    new Webpack.DefinePlugin({
      __DEV__,
    }),
    new MiniCssExtractPlugin(),
  ],
  ...(__DEV__ ? { devtool: 'source-map' } : {}),
};
