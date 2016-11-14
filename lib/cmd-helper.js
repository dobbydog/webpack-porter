const path = require('path')

function applyCommonOptions(yargs) {
  return yargs.options('targets-dir', {
    default: 'target',
    describe: 'Path to target files directory'
  })
}

function getTarget(argv) {
  let target

  try {
    target = require(path.resolve(argv.targetsDir, argv.target))
  } catch(e) {
    console.error(`[${e.code}] Target file "${target}" not found.`)
    process.abort()
  }

  return target
}

function setEnv(env) {
  process.env.NODE_ENV = env || 'development'
}

function findExecutable(name) {
  if (process.platform === 'win32') {
    name = name + '.cmd'
  }

  return path.resolve('node_modules', '.bin', name)
}

exports.applyCommonOptions = applyCommonOptions
exports.getTarget = getTarget
exports.setEnv = setEnv
exports.findExecutable = findExecutable
