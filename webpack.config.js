const path = require('path');
const webpack = require('webpack');

const env = process.env.PANOPTICAT_ENV === 'LOCAL' ? 'LOCAL' : 'GLOBAL';
const paths = {
  public: path.resolve(__dirname, 'public'),
  src: path.resolve(__dirname, 'src'),
};
const URL = {
  GLOBAL: `https://${process.env.PANOPTICAT_GLOBAL_IP}:${process.env.PANOPTICAT_GLOBAL_PORT}`,
  LOCAL: `http://localhost:${process.env.PANOPTICAT_LOCAL_PORT}`,
};

module.exports = {
  entry: path.join(paths.src, 'App.jsx'),
  output: {
    path: paths.public,
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(gif|jpe?g|png|svg)$/i,
        use: [
          {
            loader: 'file-loader?name=images/[name].[ext]',
            options: { bypassOnDebug: true },
          },
        ],

      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: true },
          },
        ],
      },
      {
        test: /.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
        use: 'file-loader',

      },
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        use: 'url-loader?limit=10000&mimetype=application/font-woff',

      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      PANOPTICAT_URL: JSON.stringify(URL[env]),
    }),
  ],
};
