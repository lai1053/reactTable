// Learn more on how to config.
// - https://github.com/ant-tool/atool-build#配置扩展

const webpack = require('etool-build/lib/webpack');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(webpackConfig) {
  webpackConfig.babel.plugins.push('transform-runtime');
  webpackConfig.babel.plugins.push(['antd', {
    style: 'css',  // if true, use less
  }]);

  webpackConfig.plugins.push(new HtmlWebpackPlugin({
      title: '金财管家',
      template: './index.html',
      filename: 'index.html'
  }))

  webpackConfig.plugins.push(new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  }))

  // Enable this if you have to support IE8.
  webpackConfig.module.loaders.unshift({
    test: /\.js?$/,
    loader: 'es3ify-loader',
  });


  webpackConfig.UglifyJsPluginConfig.output.beautify=false
  webpackConfig.UglifyJsPluginConfig.mangle = false

  //console.log(webpackConfig.UglifyJsPluginConfig)
  // Parse all less files as css module.
  // webpackConfig.module.loaders.forEach(function(loader, index) {
  //   if (typeof loader.test === 'function' && loader.test.toString().indexOf('\\.less$') > -1) {
  //     loader.test = /\.file/;
  //   }
  //   if (loader.test.toString() === '/\\.module\\.less$/') {
  //     loader.test = /\.less$/;
  //   }
  // });

  // Load src/entries/*.js as entry automatically.
  const files = glob.sync('./index.js');
  const newEntries = files.reduce(function(memo, file) {
    const name = path.basename(file, '.js');
    memo[name] = file;
    return memo;
  }, {});
  // const newEntries = {
  //   index: "./src/entries/index.js"
  // }
  webpackConfig.entry = Object.assign({}, webpackConfig.entry, newEntries);



  return webpackConfig;
};
