const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const vendors = [
	'react',
	'react-dom',
	'antd'
];

module.exports = {
    output: {
		path: path.join(__dirname, './vendor/'),
		filename: '[name].js',
		library: '[name]'
	},
    entry: {
        "vendor": vendors,
    },
	module: {
		postLoaders: [
            {
                test: /\.(jsx|js)$/,
                loaders: ['export-from-ie8/loader']
            }
        ]
	},
    plugins: [
		new webpack.DllPlugin({
		  path: path.join(__dirname, './vendor/', 'manifest.json'),
		  name: '[name]',
		  context: __dirname
		}),
		new UglifyJSPlugin({
			mangle: {
				screw_ie8: false
			},
			mangleProperties: {
				screw_ie8: false
			},
			compress: {
				screw_ie8: false
			},
			output: {
				screw_ie8: false
			}
		})
	]
};