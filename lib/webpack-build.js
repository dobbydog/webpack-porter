const helper = require('./cmd-helper');

module.exports = function webpackBuild(env, vars) {
  let compiler = helper.getWebpackCompiler({env, vars});

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);

      console.log(stats.toString({
        colors: true,
        errorDetails: true,
        chunks: true
      }));

      resolve(true);
    });
  });
};
