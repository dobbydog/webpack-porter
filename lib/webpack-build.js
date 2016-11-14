const helper = require('./cmd-helper')

module.exports = function webpackBuild(target) {
  let webpackBin = helper.findExecutable('webpack')
  let args = [
    '--progress',
    '--display-chunks',
    '--display-error-details',
    '--define', `ENV_VARS=${JSON.stringify(target.vars)}`
  ]

  helper.setEnv(target.env)

  cp.execFileSync(webpackBin, args, {stdio: 'inherit'})
}
