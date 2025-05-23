var crypto = require('crypto')

var count = process.argv[2]

function hash(str) {
  var hash = crypto.createHash('sha256')
  hash.update(str)
  return hash.digest('hex').slice(0, 8)
}

var interfaceArr = []
var hashArr = []
for (let i = 0; i < count; i++) {
  var k = hash(i + new Date())
  interfaceArr.push(`'${k}': string`)
  hashArr.push(`'${k}': ''`)
}
console.log(interfaceArr.join('\n'))
console.log('\n')
console.log(hashArr.join('\n'))
