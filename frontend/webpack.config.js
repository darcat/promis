var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
//var WebpackBundleSizeAnalyzerPlugin = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin;
var webpack = require('webpack');

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

var path = require('path');

var config = {
    entry: path.join(__dirname, 'app', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },

    module : {
        rules : [ {
            test: /\.(js)$/, use: 'babel-loader',
            /* TODO: decouple lodash to shrink the build */
            /*exclude: '/node_modules/',
            options: {
                plugins: ['lodash'],
                presets: [['env', 'react']] }*/
            },
            /* concat css */
            { test: /\.css$/, use: ExtractTextPlugin.extract({
                                fallback: 'style-loader',
                                use: 'css-loader' })
            },
            /* use these with care */
            { test: /\.png$/, use: "url-loader?limit=100000" },
            { test: /\.jpg$/, use: "file-loader" },
            /* webfonts */
            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/font-woff' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/octet-stream' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=image/svg+xml' }
        ]
    },
    devServer : {
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({template: 'app/index.html' }),
        new webpack.ProvidePlugin({
            Promise: 'es6-promise-promise'
        }),
        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify('"production"')
          }
        }),
        new ExtractTextPlugin("styles.css"),
        new LodashModuleReplacementPlugin()
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
        new webpack.optimize.OccurrenceOrderPlugin(),
        new OptimizeCssAssetsPlugin(),
        new webpack.optimize.UglifyJsPlugin()
    );
}

module.exports = config;