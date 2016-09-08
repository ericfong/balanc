const Path = require('path')
const _ = require('lodash')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')


module.exports = () => {
  const NODE_ENV = process.env.NODE_ENV || 'development'
  console.log('NODE_ENV =', NODE_ENV) // eslint-disable-line

  const conf = {
    context: __dirname,
    entry: {
      index: './index.js',
    },

    output: {
      filename: '[name].bundle.js',
      path: Path.join(__dirname, '/dist'),
      publicPath: '/',
    },

    module: {
      loaders: [
        { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel' },
        { test: /\.json$/, loader: 'json' },
        { test: /\.css$/, loader: 'style!css' },
        { test: [/\.png$/, /\.gif$/, /\.jpg$/, /\.svg$/], loader: 'url-loader' },
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
          NODE_ENV: JSON.stringify(NODE_ENV),
        },
      }),
    ],
    resolve: {
      extensions: ['', '.js', '.jsx'],
    },
  }

  const plugins = conf.plugins
  if (NODE_ENV === 'production') {
    plugins.push(
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin()
    )
  } else if (NODE_ENV === 'development') {
    plugins.push(
      new webpack.HotModuleReplacementPlugin()
    )
    _.assign(conf, {
      devtool: 'eval',
      devServer: {
        port: 5000,
        stats: { colors: true, chunks: false },
      },
    })
  }

  return conf
}
