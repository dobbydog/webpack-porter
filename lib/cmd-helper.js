const path = require('path');
const webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const HotModuleReplacementPlugin = require('webpack/lib/HotModuleReplacementPlugin');

function applyCommonOptions(yargs) {
  return yargs.options('targets-dir', {
    default: 'target',
    describe: 'Path to target files directory'
  });
}

function getTarget(argv) {
  let target;

  try {
    target = require(path.resolve(argv.targetsDir, argv.target));
  } catch(e) {
    console.error(`[${e.code}] Target file "${target}" not found.`);
    process.abort();
  }

  target.name = argv.target;

  return target;
}

function getWebpackCompiler(opts) {
  let config;

  setEnv(opts);

  try {
    config = require(path.resolve('webpack.config'));
  } catch(e) {
    console.error(`[${e.code}] Webpack config file not found.`);
    process.abort();
  }

  config.module.rules.unshift(
    {
      test: /targetVars\.ts$/,
      enforce: 'pre',
      use: [{loader: 'preprocess-loader', options: JSON.stringify({ppOptions:{type:'js'}})}]
    }
  );

  if (!config.devServer) {
    config.devServer = {};
  }

  config.devServer.host = config.devServer.host || 'localhost';
  config.devServer.port = config.devServer.port || 8080;

  if (opts.hmr) {
    let hostParam = config.devServer.host !== '0.0.0.0' ? config.devServer.host : 'localhost';
    let portParam = config.devServer.port;
    let hmrModules = [`webpack-dev-server/client?http://${hostParam}:${portParam}`, 'webpack/hot/dev-server'];

    config.plugins.push(new HotModuleReplacementPlugin());

    [].concat(config).forEach(function(config) {
      if(typeof config.entry === "object" && !Array.isArray(config.entry)) {
        for (let name in config.entry) {
          config.entry[name] = hmrModules.concat(config.entry[name]);
        };
      } else {
        config.entry = hmrModules.concat(config.entry);
      }
    });
  }

  let compiler = webpack(config);

  compiler.apply(new ProgressPlugin({profile: true}));

  return compiler;
}

function setEnv(opts) {
  process.env.NODE_ENV = opts.env || 'development';

  if (opts.hmr) {
    process.env.HMR = true;
  }

  for (let p in opts.vars) {
    process.env['PP_' + p] = opts.vars[p];
  }
}

exports.applyCommonOptions = applyCommonOptions;
exports.getTarget = getTarget;
exports.getWebpackCompiler = getWebpackCompiler;
exports.setEnv = setEnv;
