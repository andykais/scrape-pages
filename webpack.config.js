const path = require('path')
const typescriptIsTransformer = require('typescript-is/lib/transform-inline/transformer').default
const nodeExternals = require('webpack-node-externals')
const webpack = require('webpack')
const packageJson = require('./package.json')

// const glob = require('glob')
// const sourceFiles = glob
//   .sync('./src/**/*.ts', { ignore: './src/**/*.test.ts' })
//   .reduce((acc, file) => {
//     acc[file.replace(/^\.\/src\/(.*?)\.ts$/, (_, filename) => filename)] = file
//     return acc
//   }, {})

module.exports = {
  mode: 'development',
  devtool: 'source-map',

  target: 'node',
  node: {
    __dirname: true,
    __filename: true
  },

  entry: {
    index: './src/index.ts'
  },
  // entry: sourceFiles,
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js',
    library: 'scrape-pages',
    libraryTarget: 'umd'
  },

  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@scrape-pages': path.resolve(__dirname, 'src'),
      '@test': path.resolve(__dirname, 'test')
    }
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          getCustomTransformers: program => ({
            before: [
              typescriptIsTransformer(program, {
                ignoreFunctions: true,
                ignoreMethods: true,
                disallowSuperfluousObjectProperties: true
              })
            ]
          })
        }
      },
      {
        test: /\.ne$/,
        // test: path.resolve(__dirname, 'src/dsl-parser/grammar.ne'),
        loader: 'nearley-loader'
      }
    ]
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageJson.version)
    })
  ],
  externals: [nodeExternals()]
}
