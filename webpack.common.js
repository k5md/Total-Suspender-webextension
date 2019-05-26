const path = require('path');
const webpack = require('webpack');

const ExtractTextPlugin = require('extract-text-webpack-plugin');

const DIST_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');
const MANIFEST_FILE = 'manifest.json';

const manifestPath = path.join(SRC_DIR, MANIFEST_FILE);

module.exports = {
  output: {
    filename: MANIFEST_FILE,
    path: DIST_DIR,
  },
  entry: manifestPath,
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
        use: [{
          loader: 'style-loader', // inject CSS to page
        }, {
          loader: 'css-loader', // translates CSS into CommonJS modules
        }, {
          loader: 'postcss-loader', // Run post css actions
          options: {
            plugins: () => { // post css plugins, can be exported to postcss.config.js
              return [
                require('precss'),
                require('autoprefixer'),
              ];
            },
          },
        }, {
          loader: 'sass-loader', // compiles Sass to CSS
        }],
      },
      /*{
        test: /\.css$/,
        use: [
          'file-loader',
          'extract-loader',
          'css-loader',
        ],
      },*/
      {
        test: /\.(svg|png)$/,
        use: [
          'file-loader',
        ],
      },
      {
        test: /index\.js$/,
        exclude: /node_modules/,
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
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', { modules: false }],
              ],
              plugins: [
                'babel-plugin-transform-es2015-arrow-functions',
                'babel-plugin-transform-object-rest-spread',
                'babel-plugin-transform-runtime',
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
        test: manifestPath,
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
  ],
};
