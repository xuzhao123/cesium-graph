var path = require('path');

module.exports = {
	devtool: 'source-map',
	entry: './Source/CesiumGeometry.js',
	output: {
		library: 'CesiumGeometry',
		libraryTarget: 'umd',
		path: path.resolve(__dirname, 'Build'),
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