const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin
const MonacoPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

const common = {
  mode: 'development',
  devtool: 'eval',
  output: {
    filename: "[name].bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".scss"],
  },
  performance: {
    hints: 'warning',
  },
  module: {
    rules: [{
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        }
      },
      {
        test: /\.html$/,
        use: [{
          loader: "html-loader",
          options: {
            minimize: true
          }
        }]
      },
      {
        test: /\.scss$/,
        use: [
          "style-loader",
          "css-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.svg$/,
        use: {
          loader: "svg-inline-loader",
        }
      },
      {
        test: /\.css$/,
        use: [{
            loader: MiniCssExtractPlugin.loader,
            options: {
              url: false
            }
          },
          {
            loader: "css-loader",
            options: {
              url: false
            }
          },
        ]
      },
      {
        test: /\.tsx?/,
        loader: "awesome-typescript-loader",
      },
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
      }
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './public/index.html',
      filename: 'index.html'
    }),
    new MiniCssExtractPlugin({
      filename: "service-development.css",
    }),
    new CheckerPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
  }
};

module.exports = [
  {
    ...common,
    entry: {
      monaco: './index',
    },
    output: {
      ...common.output,
      path: path.resolve('dist', 'monaco'),
      library: 'monaco',
      libraryTarget: 'umd',
    },
  },
  {
    ...common,
    entry: "./src/index.tsx",
    output: {
      filename: 'service-development.js',
    }
  }
];
