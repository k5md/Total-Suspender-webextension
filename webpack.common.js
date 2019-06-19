const path = require('path');
const webpack = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const JSXJS = path.resolve(__dirname, 'src/jsx.js');
const DIST_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');

const MANIFEST_FILE = 'manifest.json';
const MANIFEST_PATH = path.join(SRC_DIR, MANIFEST_FILE);

module.exports = {
  output: {
    filename: MANIFEST_FILE,
    path: DIST_DIR,
  },
  entry: MANIFEST_PATH,
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          'file-loader',
          'extract-loader',
          {
            loader: 'html-loader',
            options: {
              attrs: [
                'link:href',
                'script:src',
                'img:src',
              ],
            },
          },
        ],
      },
      {
        test: /\.(scss)$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(svg|png)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /index\.js$/,
        include: [
          path.resolve(__dirname, 'src/background/index.js'),
          path.resolve(__dirname, 'src/popup/index.js'),
        ],
        use: [
          {
            loader: 'spawn-loader',
            options: {
              name: '[hash].js',
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/, /__tests__/],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['babel-preset-env', { modules: false }],
              ],
              plugins: [
                'babel-plugin-transform-object-rest-spread',
                'babel-plugin-transform-class-properties',
                ['babel-plugin-transform-jsx', { module: JSXJS, useVariables: true }],
              ],
            },
          },
          {
            loader: 'imports-loader',
            query: '__babelPolyfill=babel-polyfill',
          },
        ],
      },
      {
        test: MANIFEST_PATH,
        use: ExtractTextPlugin.extract([
          'raw-loader',
          'extricate-loader',
          'interpolate-loader',
        ]),
      },
      {
        test: require.resolve('webextension-polyfill'),
        use: 'imports-loader?browser=>undefined',
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin(MANIFEST_FILE),
    new webpack.ProvidePlugin({
      browser: 'webextension-polyfill',
    }),
    new CopyPlugin([
      {
        from: 'src/_locales',
        to: '_locales',
      },
    ]),
  ],
};
