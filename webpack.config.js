const path = require('path');
const webpack = require('webpack');

const environment = process.env.ENVIRONMENT;

console.log('environment:::::', environment);

let ENVIRONMENT_VARIABLES = {
  'process.env.ENVIRONMENT': JSON.stringify('development'),
  'process.env.PORT': JSON.stringify('5000'),
  'process.env.MONGODB_URI': JSON.stringify('mongodb://localhost:27017/pluvalu')
};

if (environment === 'test') {
  ENVIRONMENT_VARIABLES = {
    'process.env.ENVIRONMENT': JSON.stringify('test'),
    'process.env.ACCESS_TOKEN_SECRET': JSON.stringify('pluvalu'),
    'process.env.REFRESH_TOKEN_SECRET': JSON.stringify('pluvalu'),
    'process.env.PORT': JSON.stringify('5000'),
  'process.env.MONGODB_URI': JSON.stringify('mongodb://mongo:27017/pluvalu'),
    'process.env.CLIENT_URL': JSON.stringify('http://localhost:3000'),
    'process.env.OLDEST_CONTENT': JSON.stringify('1689448833912')
  };
} else if (environment === 'production') {
  ENVIRONMENT_VARIABLES = {
    'process.env.ENVIRONMENT': JSON.stringify('production'),
    'process.env.PORT': JSON.stringify('80'),
    'process.env.MONGO_CONNECTION_STRING': JSON.stringify('mongodb://webapp-mongo:7PtungzvxxQnHp8XFOrVrhNkOTLm847Hw3OHnkeHgvtC0eiNJlt5NukvXIPXuvEjUL98SchoVtZlHlg15CEBgg==@webapp-mongo.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@webapp-mongo@')
  };
}

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'api.bundle.js',
  },
  target: 'node',
  plugins: [
    new webpack.DefinePlugin(ENVIRONMENT_VARIABLES),
  ],
};