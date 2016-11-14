exports.escapeRegExp = str => {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

exports.chomp = (str, char) => {
  return str.replace(new RegExp(escapeRegExp(char) + '+$'), '')
}

exports.normalizedRelativePath = (pathStr, root) => {
  let relative = pathStr.replace(new RegExp(escapeRegExp(root)), '').replace(/\\/g, '/')

  return relative === '' ? '(root dir)' : relative.substr(1)
}
