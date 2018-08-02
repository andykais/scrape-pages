const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: __dirname + '/dist'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin([
      {
        from: 'node_modules/@fortawesome/fontawesome-free/css/all.min.css',
        to: 'css/'
      },
      {
        from: 'node_modules/@fortawesome/fontawesome-free/webfonts',
        to: 'webfonts/'
      },
      {
        from: 'CNAME'
      }
    ]),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    })
    // new AddAssetHtmlPlugin({ filepath: 'css/all.min.css' }),
    // new HtmlWebpackIncludeAssetsPlugin({
    // assets: ['file.css'],
    // append: false,
    // publicPath: 'css/'
    // })
  ]
}
