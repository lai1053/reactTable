﻿var webpack = require("webpack")
var path = require("path")
var fs = require('fs')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var ManifestPlugin = require('webpack-manifest-plugin')
// ie9 下单个的css文件超过400k 不被解析
// var CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default
//const marauderDebug = require('sinamfe-marauder-debug')
const es3ifyWebpackPlugin = require('es3ify-webpack-plugin-v2')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')

//const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const merge = require('webpack-merge')
const webpackCompileParams = require('./webpackCompileParams')
var env = process.env.NODE_ENV
var plugins = []

var projectRootPath = path.resolve(__dirname, './')

var defaultStyle = ["./assets/styles/businessBlue.less"]
var orangeStyle = ["./assets/styles/orange.less"]
var yellowStyle = ["./assets/styles/yellow.less"]
var blueStyle = ["./assets/styles/blue.less"]
var version_ie8 = './compatible/dist/index.html'

const version_ie8_bol = fs.existsSync(path.resolve(projectRootPath, version_ie8))


//node环境变量，生产环境：production，开发环境：development
plugins.push(new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(env)
}))

//plugins.push(new webpack.ExtendedAPIPlugin())
plugins.push(new webpack.optimize.ModuleConcatenationPlugin())

plugins.push(new webpack.DllReferencePlugin({
    context: __dirname,
    manifest: merge(require('./vendor/vendor.manifest.json')),
}))

plugins.push(new CleanWebpackPlugin(['dist'], {
    root: __dirname
}))
// plugins.push(new CSSSplitWebpackPlugin({size: 3000}))
plugins.push(
    new ParallelUglifyPlugin({
        cacheDir: '.cache/',
        uglifyJS: {
            output: {
                comments: false
            }
        }
    })
)
/*
plugins.push(new webpack.optimize.CommonsChunkPlugin({
    names: ['bundle', 'edf'],
    filename: '[name].[hash:8].min.js',
    minChunks: Infinity
}))*/
//'bundle', 'edf', 'icon', 'businessBlueTheme'
plugins.push(new ManifestPlugin())
plugins.push(new es3ifyWebpackPlugin())
plugins.push(new webpack.NoEmitOnErrorsPlugin())
plugins.push(new HtmlWebpackPlugin({
    title: '金财管家', //标题
    favicon: './assets/img/favicon.ico', //favicon路径
    filename: 'index.html', //生成的html存放路径，相对于 path
    template: 'index.html', //html模板路径
    chunks: [],
    hash: false,
    inject: 'body', //允许插件修改哪些内容，包括head与body`
    minify: { //压缩HTML文件
        removeComments: true, //移除HTML中的注释
        collapseWhitespace: true, //删除空白符与换行符
        removeAttributeQuotes: true
    }
}))

plugins.push(new ExtractTextPlugin('[name].css'))
plugins.push(new LodashModuleReplacementPlugin)
/*
plugins.push(new OptimizeCssAssetsPlugin(
    {
        cssProcessorOptions: { discardComments: { removeAll: true } },
        canPrint: false
    }
))*/
plugins.push(new CopyWebpackPlugin([{
    from: './version.txt',
    to: 'version.txt',
    toType: 'template'
}]))
/*
plugins.push(new CopyWebpackPlugin([{
    from: './robots.txt',
    to: 'robots.txt',
    toType: 'file'
}]))
*/
plugins.push(new CopyWebpackPlugin([{
    from: './checkLowBrowser.js',
    to: 'checkLowBrowser.js',
    toType: 'template'
}]))

plugins.push(new CopyWebpackPlugin([{
    from: './tplus.html',
    to: 'tplus.html',
    toType: 'file'
}]))

plugins.push(new CopyWebpackPlugin([{
    from: './notfound.html',
    to: 'notfound.html',
    toType: 'file'
}]))

plugins.push(new CopyWebpackPlugin([{
    from: './transfer.html',
    to: 'transfer.html',
    toType: 'file'
}]))

plugins.push(new CopyWebpackPlugin([{
    from: './sso.html',
    to: 'sso.html',
    toType: 'file'
}]))

plugins.push(new CopyWebpackPlugin([{
    from: './vendor',
    to: './vendor',
    ignore: ['.*']
}]))

/*报表转换-国税项目 */
plugins.push(new CopyWebpackPlugin([{
    from: './transreport',
    to: './transreport',
    ignore: ['.*']
}]))

if (version_ie8_bol) {
    plugins.push(new CopyWebpackPlugin([{
        from: './compatible/dist',
        to: './version/ie8',
        ignore: ['.*']
    }]))
}

const { modifyVars, aliasModule } = webpackCompileParams()

module.exports = {
    devtool: false,
    entry: {
        edf: ["edf-app-loader", "edf-meta-engine", "edf-component", "edf-consts", "edf-utils", "webapi", "./index.js"],
        businessBlueTheme: defaultStyle.concat(['./assets/apps/businessBlue.less']),
        orangeTheme: orangeStyle.concat(['./assets/apps/orange.less']),
        blueTheme: blueStyle.concat(['./assets/apps/blue.less']),
        yellowTheme: yellowStyle.concat(['./assets/apps/yellow.less']),
        // blackTheme: "./assets/styles/black.less",
        // greenTheme: "./assets/styles/green.less",
        // yellowTheme: "./assets/styles/yellow.less",
        ie: './assets/styles/ie.less',
        icon: "./component/assets/style/iconset.less"
    },

    output: {
        path: path.join(__dirname, "/dist/"),
        filename: '[name].min.js',
        chunkFilename: '[name].chunk.js'
    },

    resolve: {
        extensions: [".js"],
        alias: Object.assign({
            'edf-app-loader': path.resolve(projectRootPath, './app-loader/index.js'),
            'edf-meta-engine': path.resolve(projectRootPath, './meta-engine/index.js'),
            'edf-component': path.resolve(projectRootPath, './component/index.js'),
            'edf-utils': path.resolve(projectRootPath, './utils/index.js'),
            'webapi': path.resolve(projectRootPath, './api/index.js'),
            'edf-consts': path.resolve(projectRootPath, './constant/consts.js'),
            'edf-constant': path.resolve(projectRootPath, './constant/index.js'),
            'eharts': path.resolve(projectRootPath, './vendor/echarts.min.js'),
            'zrender': path.resolve(projectRootPath, './vendor/zrender.min.js')
        }, aliasModule)
    },
    externals: {
        "echarts": 'echarts',
        "zrender": 'zrender',
    },
    module: {
        rules: [{
            test: /\.(css|less)/,
            use: ExtractTextPlugin.extract({
                fallback: 'style-loader',
                use: [{
                    loader: "css-loader",
                    options: {
                        minimize: true
                    }
                }, {
                    loader: "less-loader",
                    options: {
                        "modifyVars": modifyVars
                    }
                }]
            })
        }, {
            test: /\.js?$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true
                }
            }]
        }, {
            test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif|mp4|webm)(\?\S*)?$/,
            use: {
                loader: 'url-loader',
                options: {
                    name: '[name].[ext]',
                    limit: 8192
                }
            }
        }],
    },
    devServer: {
        contentBase: './dist/',
        proxy: {
            '/v1/*': 'http://debug.aierp.cn:8085/',
            '/share-oss/*': 'http://debug.aierp.cn:8085/',
        }
    },
    plugins: plugins
}
