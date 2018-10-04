const { resolve } = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const TerserPlugin = require('terser-webpack-plugin')
const NodemonPlugin = require('nodemon-webpack-plugin')
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin')
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const devPlugins = env =>
  env
    ? [
        new CleanTerminalPlugin(),
        ...((env.scratchfile !== true &&
          new NodemonPlugin({
            script: env.scratchfile,
            watch: [resolve('./lib'), resolve(env.scratchfile)]
          })) ||
          [])
      ]
    : []

module.exports = env => ({
  target: 'node',
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    // index: './src/index.ts',
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
            loader: 'ts-loader'
            // options: {
            // transpileOnly: true
            // }
          }
          // {
          // loader: resolve(__dirname, 'loader.js'),
          // options: {
          // files: [
          // resolve(__dirname, 'src/configuration/assert-config-type.ts')
          // ]
          // }
          // }
        ]
      },
      {
        test: /\.sql$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: [
    // new ForkTsCheckerWebpackPlugin(),
    new CopyWebpackPlugin([
      'package.json',
      'package-lock.json',
      'LICENSE',
      'README.md'
    ]),
    ...devPlugins(env)
  ],
  optimization: {
    minimizer: [new TerserPlugin()]
  },
  externals: [nodeExternals()]
})
