const Path = require('path')
const webpack = require('webpack')  // eslint-disable-line

module.exports = () => {
  return {
    context: __dirname,
    entry: {
      'createPdf': './src/createPdf',
    },

    output: {
      path: Path.join(__dirname, 'lib'),
      filename: '[name].js',
      libraryTarget: 'umd',
      // library: 'createPdf',
      // umdNamedDefine: true,
    },

    module: {
      loaders: [
        { test: /\.jsx?$/, exclude: /(node_modules|bower_components)/, loader: 'babel' },
        // { test: /\.json$/, loader: 'json' },
      ],
    },
    plugins: [
      // new webpack.DefinePlugin({
      //   'process.env': {
      //     NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      //     BALANC_API: JSON.stringify(process.env.BALANC_API),
      //   },
      // }),
    ],
    resolve: {
      extensions: ['.js'],
    },

    // devtool: 'source-map',
  }
}
