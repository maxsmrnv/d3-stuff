const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.js'
  },
  devServer: {
    contentBase: './dist',
    hot: true,
    after(app, server) {
      const chokidar = require('chokidar');
      const files = ['src/*.html'];

      chokidar
        .watch(files, {
          alwaysStat: true,
          followSymlinks: false,
          ignoreInitial: true
        })
        .on('all', () => {
          server.sockWrite(server.sockets, 'content-changed');
        });
    }
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: [/.js$/],
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [['@babel/transform-runtime']]
          }
        }
      },
      {
        test: [/.css$/],
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
