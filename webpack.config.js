const path = require('path')
const glob = require('glob')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const typescriptIsTransformer = require('typescript-is/lib/transform-inline/transformer').default
const packageJson = require('./package')

const sourceFiles = glob
  .sync('./src/**/*.ts', { ignore: './src/**/*.test.ts' })
  .reduce((acc, file) => {
    acc[file.replace(/^\.\/src\/(.*?)\.ts$/, (_, filename) => filename)] = file
    return acc
  }, {})

module.exports = (env, { mode = 'development' } = {}) => ({
  target: 'node',
  node: {
    __dirname: true,
    __filename: true
  },
  mode,
  devtool: 'source-map',

  entry: sourceFiles,
  output: {
    path: path.resolve(__dirname, 'lib'),
    filename: '[name].js',
    library: 'scrape-pages',
    libraryTarget: 'umd',
    // devtoolModuleFilenameTemplate: '[]webpack:[resource-path]',
    devtoolModuleFilenameTemplate: 'webpack:[resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]'
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [
      {
        test: content => env === 'coverage' && /\.ts$/.test(content),
        include: path.resolve(__dirname, 'src'),
        exclude: [/node_modules/, /\.test\.ts$/, /query-debugger\.ts$/],
        loader: 'istanbul-instrumenter-loader',
        options: { esModules: true },
        enforce: 'post'
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers: program => ({
            before: [typescriptIsTransformer(program)]
          }),
          // compiler: 'ttypescript',
          configFile: 'tsconfig/tsconfig.json'
        }
      },
      {
        test: /\.sql$/,
        use: 'raw-loader'
      }
    ]
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new CopyWebpackPlugin(['package.json', 'package-lock.json', 'LICENSE', 'README.md']),
    new webpack.DefinePlugin({
      'process.env.PACKAGE_VERSION': JSON.stringify(packageJson.version)
    })
  ],
  externals: [nodeExternals()]
})
