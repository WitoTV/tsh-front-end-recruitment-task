const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); 

const config = {
	'context': path.resolve(__dirname, 'src'),
	'devServer': {
		'contentBase': path.resolve(__dirname, './dist/assets/media'),
		'compress': true,
		'port': 2000,
		'stats': 'errors-only',
		'open': true
	},
	'devtool': 'inline-source-map',
	'plugins': [
		new MiniCssExtractPlugin({
			'filename': 'css/style.css',
			'chunkFilename': 'css/[name].css'
		}),
		new HtmlWebpackPlugin({
			'template': 'index.html',
			'filename': 'index.html'
		}),
		new CleanWebpackPlugin(['dist'])
	],
	'entry': {
		'app': './index.js'
	},
	'output': {
		'path': path.resolve(__dirname, 'dist'),
		'filename': 'js/[name].bundle.js'
	},
	'module': {
		'rules': [
			{
				'test': /\.js$/,
				'include': /src/,
				'exclude': /node_modules/,
				'use': [
					{
						'loader': 'babel-loader'
					}
				]
			},
			{
				'test': /\.html$/,
				'use': [
					{
						'loader': 'html-loader',
						'options': {
							'minimalize': true
						}
					}
				]
			},
			{
				'test': /\.s?css$/,
				'exclude': /node_modules/,
				'use': [
					{
						'loader': MiniCssExtractPlugin.loader
					},
					{
						'loader': 'css-loader',
						'options': {
							'importLoaders': 2,
							'sourceMap': true
						}
					},
					{
						'loader': 'postcss-loader',
						'options': {
							'ident': 'postcss',
							'plugins': () => [
								require('autoprefixer')()
							]
						}
					},
					{
						'loader': 'sass-loader',
						'options': {
							'sourceMap': true
						}
					}
				]
			},
			{
				test: /\.(jpg|png|gif|svg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
							outputPath: './assets/media/'
						}
					}
				]
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: ['file-loader']
			}
		]
	},
	'optimization': {
		'namedModules': true,
		'splitChunks': {
			'cacheGroups': {
				'default': false,
				'commons': {
					'test': /[\\/]node_modules[\\/].*\.js$/,
					'name': 'vendor',
					'chunks': 'all'
				},
				'style': {
					'test': /\.(sass|scss|css)$/,
					'name': 'style', 
					'minChunks': 1,
					'reuseExistingChunk': true,
					'enforce': true
				}
			}
		}
	}
};

module.exports = config;
