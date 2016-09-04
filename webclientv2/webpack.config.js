var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports = {

  devtool: 'cheap-module-eval-source-map',

  entry: {
    'polyfills': './src/polyfills.ts',
    'vendor': './src/vendor.ts',
    'app': './src/main.ts'
  },
  output: {
    path: '../public',
    filename: 'v2/[name].bundle.js',
    chunkFilename:'v2/[id].chunk.js'
  },
  module:{
    preLoaders:[
      {
        test: /.js$/,
        loader: 'string-replace-loader',
        query: {
          search: 'moduleId: module.id,',
          replace: '',
          flags: 'g'
        }
      }
    ],
    loaders:[
      {test: /\.ts$/, loader: 'ts'},
      {test: /\.css$/, loader: 'style!css'},
      {test: /\.json$/, loader: 'json'}
    ]
  },
  resolve:{
    extensions: ['', '.js', '.ts']
  },
  plugins:[
    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills'],
    }),

    new LiveReloadPlugin({
      appendScriptTag: true
    }),

    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'v2/index.html'
    })
  ]

};