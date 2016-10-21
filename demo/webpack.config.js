const Path = require('path')
const webpack = require('webpack')  // eslint-disable-line
const HtmlWebpackPlugin = require('html-webpack-plugin')  // eslint-disable-line

module.exports = () => {
  return {
    context: __dirname,
    entry: {
      index: './index',
    },

    output: {
      filename: '[name].bundle.js',
      path: Path.join(__dirname, '../_book/demo'),
      // publicPath: '/',
    },

    module: {
      loaders: [
        { test: /\.jsx?$/, exclude: /(node_modules|bower_components)/, loader: 'babel' },
        { test: /\.json$/, loader: 'json' },
        // { test: /\.css$/, loader: 'style!css' },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        chunks: ['index'],
        inject: 'body',
        hash: true,
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          BALANC_API: JSON.stringify(process.env.BALANC_API),
        },
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.IgnorePlugin(/regenerator|nodent|js\-beautify/, /ajv/),
    ],
    resolve: {
      extensions: ['.js', '.jsx'],
    },

    devtool: 'source-map',
    devServer: {
      port: 8008,
      stats: { colors: true, chunks: false },
      proxy: {
        '/v1': {
          target: 'http://localhost:8000',
        },
      },
    },
  }
}
