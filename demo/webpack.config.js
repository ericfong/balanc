const Path = require('path')
const webpack = require('webpack')  // eslint-disable-line
const HtmlWebpackPlugin = require('html-webpack-plugin')  // eslint-disable-line

module.exports = (env) => {
  console.log('env', env) // eslint-disable-line
  Object.assign(process.env, env)

  const conf = {
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
          NODE_ENV: JSON.stringify(process.env.NODE_ENV),
          BALANC_API: JSON.stringify(process.env.BALANC_API),
        },
      }),
      new webpack.HotModuleReplacementPlugin(),
    ],
    resolve: {
      extensions: ['.js', '.jsx'],
    },

    devtool: 'eval',
    devServer: {
      port: 7000,
      stats: { colors: true, chunks: false },
      proxy: {
        '/v1': {
          target: 'http://localhost:8000',
        },
      },
    },
  }

  return conf
}
