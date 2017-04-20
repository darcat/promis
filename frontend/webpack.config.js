var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
//var WebpackBundleSizeAnalyzerPlugin = require('webpack-bundle-size-analyzer').WebpackBundleSizeAnalyzerPlugin;
var webpack = require('webpack');

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

var path = require('path');

var config = {
    entry: {
        //abc: path.join(__dirname, 'app', 'loader.js'),
        main: path.join(__dirname, 'app', 'index.js')
    },
    output: {
        path: path.join(__dirname, 'public'),
        filename: '[name]-[hash].js',
        sourcePrefix: '',
        publicPath: '/'
    },

    module : {
        unknownContextCritical: false,
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
            {
                test: /\.(png|gif|jpg|jpeg)$/,
                loader: 'file-loader'
            },
            /*{ test: /\.png$/, use: "url-loader?limit=100000" },
            { test: /\.jpg$/, use: "file-loader" },*/
            /* webfonts */
            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/font-woff' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/octet-stream' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=image/svg+xml' }
        ]
    },
    devServer : {
        historyApiFallback: true,
        contentBase: './public'
    },
    plugins: [
        new webpack.optimize.CommonsChunkPlugin("common.js"),
        new HtmlWebpackPlugin({
            minChunks: Infinity,
            chunksSortMode: function (a, b) {  //alphabetical order
                if (a.names[0] > b.names[0]) {
                    return 1;
                }
                if (a.names[0] < b.names[0]) {
                    return -1;
                }
                return 0;
            },
            template: 'app/index.html',
            inject: true 
        }),
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
        new OptimizeCssAssetsPlugin({
            cssProcessorOptions: {
                safe: true, /* preserve z-indexes */
        }}),
        new webpack.optimize.UglifyJsPlugin()
    );
}

module.exports = config;
