const cp = require('child_process')
const helper = require('../lib/cmd-helper')

exports.command = 'server <target>'
exports.desc = 'Start webpack dev server'
exports.builder = yargs => helper.applyCommonOptions(yargs)
exports.handler = argv => {
  let target = helper.getTarget(argv)
  let devServerBin = helper.findExecutable('webpack-dev-server')
  let args = [
    '--progress',
    '--hot',
    '--inline',
    '--define', `ENV_VARS=${JSON.stringify(target.vars)}`
  ]

  helper.setEnv(target.env)

  cp.execFileSync(devServerBin, args, {stdio: 'inherit'})
}
