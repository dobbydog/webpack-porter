const helper = require('./cmd-helper');

module.exports = function webpackBuild(env, vars) {
  let compiler = helper.getWebpackCompiler({env, vars});

  compiler.run((err, stats) => {
    if (err) console.error(err);

    console.log(stats.toString({
      colors: true,
      errorDetails: true,
      chunks: true
    }));
  });
};
