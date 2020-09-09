const webpack = require('etool-build/lib/webpack');
var path = require("path")
var fs = require('fs')
var ExtractTextPlugin = require("extract-text-webpack-plugin")
// ie9 下单个的css文件超过400k 不被解析
var CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default

const webpackCompileParams = require('./webpackCompileParams')
var env = process.env.NODE_ENV
var plugins = []

var projectRootPath = path.resolve(__dirname, './')

module.exports = function (webpackConfig) {
    webpackConfig.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
        })
    )

    //webpackConfig.plugins.push(new webpack.optimize.ModuleConcatenationPlugin())

    webpackConfig.plugins.push(new CSSSplitWebpackPlugin({ size: 3000 }))
    //webpackConfig.plugins.push(new ExtractTextPlugin('[name].css'))

    webpackConfig.entry = {
        blueTheme: "./assets/styles/blue.less",
        businessBlueTheme: "./assets/styles/blue.less",
        orangeTheme: "./assets/styles/orange.less",
        yellowTheme: "./assets/styles/yellow.less",
        ie: "./assets/styles/ie.less",
    }
    webpackConfig.output.path = webpackConfig.output.path + '/splitcss'
    var [CommonsChunkPlugin, ExtractTextPlugin, OccurrenceOrderPlugin, ProgressPlugin, NpmInstallPlugin, ...more] = webpackConfig.plugins;
    webpackConfig.plugins = [CommonsChunkPlugin, ExtractTextPlugin, OccurrenceOrderPlugin, ProgressPlugin, ...more];

    return webpackConfig;

};


