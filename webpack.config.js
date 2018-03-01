var path = require('path');
var fileHelper = require('./webpack-util/fileHelper');

fileHelper.copy(__dirname+'/Source/Textures','Build/CesiumGeometry/Textures');

module.exports = {
	devtool: 'source-map',
	entry: './Source/cesiumGeometry.js',
	output: {
		library: 'CesiumGeometry',
		libraryTarget: 'umd',
		path: path.resolve(__dirname, 'Build/CesiumGeometry'),
		filename: 'CesiumGeometry.js'
	},
	externals: [
		'Cesium',
		/^Cesium\/.+$/
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env']
					}
				}
			},
			{
				test: /\.glsl$/,
				use: {
					loader: 'webpack-glsl-loader'
				}
			}
		]
	}
};