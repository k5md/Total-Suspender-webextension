const merge = require('webpack-merge');
const common = require('./webpack.common.js');

const MinifyPlugin = require('babel-minify-webpack-plugin');
const PrettierPlugin = require("prettier-webpack-plugin");

module.exports = merge(common, {
  plugins: [
    new MinifyPlugin(),
    new PrettierPlugin({
      endOfLine: 'lf',
    }),
  ],
});
