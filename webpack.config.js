const { resolve } = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const TerserPlugin = require('terser-webpack-plugin')
const NodemonPlugin = require('nodemon-webpack-plugin')
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin')

const devPlugins = [new CleanTerminalPlugin()]

module.exports = (env, { mode }) => ({
  target: 'node',
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    index: './src/index.ts',
    'normalize-config': './src/configuration/normalize.ts'
  },
  output: {
    path: resolve(__dirname, 'lib'),
    filename: '[name].js',
    library: 'scrape-pages',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.sql$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      'package.json',
      'package-lock.json',
      'LICENSE',
      'README.md'
    ]),
    ...(mode === 'development' ? devPlugins : [])
  ],
  optimization: {
    minimizer: [new TerserPlugin()]
  },
  externals: [nodeExternals()]
})
