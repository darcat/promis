var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
//var WebpackBundleSizeAnalyzerPlugin = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin;
var webpack = require('webpack');

var config = {
	entry: './app/index.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
		publicPath: '/'
	},

	module : {
		rules : [
			{ test: /\.(js)$/, use: 'babel-loader' },
			{ test: /\.css$/, use: [ 'style-loader', 'css-loader' ]}
		]
	},
	devServer : {
		historyApiFallback: true
	},
	plugins: [
		new HtmlWebpackPlugin({template: 'app/index.html' }),
		new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify('"production"')
          }
        })
	]
}

if (process.env.NODE_ENV === 'production') {
	config.plugins.push(
		/* pass NODE_ENV down to to-be-compiled code */
		new webpack.DefinePlugin({
			'process.env' : {
				'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
			}
		}),
		new webpack.optimize.UglifyJsPlugin()
	);
}

module.exports = config;