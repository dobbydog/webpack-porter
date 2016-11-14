const Client = require('ssh2').Client
const colors = require('colors')
const path = require('path')
const fs = require('fs')
const util = require('./util')

function SftpSync(config, options) {
  this.config = config
  this.options = options
  this.client = new Client
}

SftpSync.prototype.start = function() {
  let localDir = path.resolve(this.config.localDir)
  let remoteDir = this.config.remoteDir

  if (localDir.endsWith(path.sep)) localDir = util.chomp(localDir, path.sep)
  if (remoteDir.endsWith('/')) remoteDir = util.chomp(localDir, '/')

  if (!fs.statSync(localDir).isDirectory()) {
    throw new Error('src: ' + localDir + ' is not directory')
  }

  console.log(`* Deploying to host ${config.host}`.green)
  console.log('* local dir  = '.gray + localDir)
  console.log('* remote dir = '.gray + remoteDir)
  console.log('')

  this.client.on('ready', () => {
    this.sync(localDir, remoteDir).then(() => {
      console.log('done')
      client.end()
    })
  })
  .connect({
    port: this.config.port || 22,
    host: this.config.host,
    username: this.config.username,
    password: this.config.password,
    passphrase: this.config.passphrase,
    privateKey: fs.readFileSync(this.config.privateKey)
  })
}

SftpSync.prototype.getSftp = function() {
  if (this.sftp) {
    return Promise.resolve(this.sftp)
  }

  return new Promise((resolve, reject) => {
    this.client.sftp((err, sftp) => {
      if (err) reject(err)

      this.sftp = sftp
      resolve(sftp)
    })
  })
}

SftpSync.prototype.sync = function(localPath, remotePath) {
  return this.buildProject(localPath, remotePath).then(project => {
    let operations = []

    project.forEach((stats, filename) => {
      let localFilePath = localPath + path.sep + filename
      let remoteFilePath = remotePath + '/' + filename
      let tasks = getTasks(stats)

      if (this.options.dryRun) {
        console.log(`[ ${label(stats.local)} | ${label(stats.remote)} ] ` + util.normalizedRelativePath(localFilePath, this.localDir))
        console.log(`          -> ${tasks.join(',')}`.magenta)
        console.log('')

        if (tasks.indexOf('sync') !== -1) {
          operations.push(this.sync(localFilePath, remoteFilePath))
        }
        return
      }

      tasks.forEach(task => {
        let args = task === 'removeRemote' ? [remoteFilePath] : [localFilePath, remoteFilePath]
        operations.push(this[task].apply(this, args))
      })
    })

    return Promise.all(operations)
  }).then(() => {
    if (!this.options.dryRun) {
      console.log('     sync completed : '.cyan + util.normalizedRelativePath(localPath, this.localDir))
    }

    return true
  })
}

SftpSync.prototype.upload = function(localPath, remotePath) {
  return new Promise((resolve, reject) => {
    this.getSftp().then(sftp => {
      sftp.fastPut(localPath, remotePath, (err) => {
        if (err) reject(err)

        console.log('      file uploaded : '.yellow + util.normalizedRelativePath(localPath, this.localDir))
        resolve()
      })
    })
  })
}

SftpSync.prototype.removeRemote = function(remotePath) {
  return new Promise((resolve, reject) => {
    this.getSftp().then(sftp => {
      sftp.stat(remotePath, (err, stat) => {
        if (err) reject(err)

        if (stat.isDirectory()) {
          sftp.readdir(remotePath, (err, list) => {
            if (err) reject(err)

            let children = []

            list.forEach(file => {
              children.push(this.removeRemote(remotePath + '/' + file.filename))
            })

            Promise.all(children).then(() => {
              sftp.rmdir(remotePath, err => {
                if (err) reject(err)

                console.log(' remote dir removed : '.red + util.normalizedRelativePath(remotePath, this.remoteDir))
                resolve()
              })
            })
          })
        } else {
          sftp.unlink(remotePath, err => {
            if (err) reject(err)

            console.log('remote file removed : '.red + util.normalizedRelativePath(remotePath, this.remoteDir))
            resolve()
          })
        }
      })
    })
  })
}

SftpSync.prototype.buildProject = function(localPath, remotePath) {
  let localList = fs.readdirSync(localPath)
  let project = new Map()
  let operations = []

  localList.forEach(filename => {
    let stat = fs.statSync(localPath + path.sep + filename)
    project.set(filename, {local: stat.isDirectory() ? 'dir' : 'file', remote: null})
  })

  return new Promise((resolve, reject) => {
    this.getSftp().then(sftp => {
      sftp.readdir(remotePath, (err, remoteList) => {
        if (err) reject(err)

        remoteList.forEach(file => {
          let setStat = new Promise((resolve2, reject2) => {
            sftp.stat(remotePath + '/' + file.filename, (err, stat) => {
              if (err) reject2(err)

              let type = stat.isDirectory() ? 'dir' : 'file'
              let stats

              if (project.has(file.filename)) {
                stats = project.get(file.filename)
                stats.remote = type
              } else {
                stats = {local: null, remote: type}
              }

              project.set(file.filename, stats)

              resolve2()
            })
          })

          operations.push(setStat)
        })

        Promise.all(operations)
        .then(() => resolve(project))
        .catch(err => reject(err))
      })
    })
  })
}

function getTasks(stats) {
  let tasks = []

  if (!stats.local || (stats.remote && stats.local !== stats.remote)) {
    tasks.push('removeRemote')
  }

  if (stats.local === 'dir') {
    tasks.push('sync')
  } else if (stats.local === 'file') {
    tasks.push('upload')
  }

  return tasks
}

function label(stat) {
  return stat === 'dir' ? 'D'.cyan : (stat === 'file' ? 'F'.yellow : 'X'.gray)
}

module.exports = SftpSync
