import webpack from 'webpack'
import path from 'path'

const name = 'PHPcURLCodeGenerator'

const config = {
  target: 'node-webkit',
  mode: 'production',
  entry: './src/PHPcURLCodeGenerator.js',
  output: {
    path: path.resolve(__dirname, `./build/com.luckymarmot.PawExtensions.${name}`),
    publicPath: '/build/',
    filename: `${name}.js`
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: /\.php$/,
        use: 'raw-loader'
      }
    ]
  }
}

export default config
