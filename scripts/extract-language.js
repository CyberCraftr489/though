// 本文件用来提取组件中的中文文案，并生成 hash 格式的语言包，简化文案提取工作
var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var fse = require('fs-extra')
var shelljs = require('shelljs')

// utils
function unique(arr) {
  return Array.from(new Set(arr))
}

function hash(str) {
  var hash = crypto.createHash('sha256')
  hash.update(str)
  return hash.digest('hex').slice(0, 8)
}

// 输入组件名称，例如 Input 组件， node scripts/extract-language.js Input
// 组件的 demo.tsx 中 demo 组件名字应该为 组件名称 + Demo，例如：InputDemo，CheckboxDemo 等
var pkg = process.argv[2]
var locals = ['zh-CN', 'zh-TW', 'en-US']

var demoFile = path.join(
  process.cwd(),
  `src/packages/${pkg.toLocaleLowerCase()}/demo.tsx`
)
let demoContent = fs.readFileSync(demoFile).toString()

var matchingChinese =
  /([0-9a-z]*[\u4e00-\u9fa5]+[0-9]*[\u4e00-\u9fa5()（）0-9a-z\/]*)/gi
var unrepeatedChinese = unique(demoContent.match(matchingChinese))

var localTable = {}
var interfaceType = []

unrepeatedChinese.forEach((item) => {
  var k = hash(item)
  localTable[k] = item
  interfaceType.push(`"${k}": string`)
  // 要处理重复
  item = item
    .replace('(', '\\(')
    .replace(')', '\\)')
    .replace('（', '\\（')
    .replace('）', '\\）')
  demoContent = demoContent
    .replace(new RegExp(`=\"${item}\"`, 'g'), `={translated['${k}']}`)
    .replace(new RegExp(`>\\s*${item}\\s*<`, 'g'), `>{translated['${k}']}<`)
    .replace(new RegExp(`\'${item}\'`, 'g'), `translated['${k}']`)
})

// interface
var interfaceTemplate = `interface T {
  ${interfaceType.join('\n  ')}
}`

var translate = {}
locals.forEach((item) => (translate[item] = localTable))
var translateHookTemplate = `
var [translated] = useTranslate<T>(${JSON.stringify(translate, ' ', 2)})
`

demoContent =
  `import { useTranslate } from '../../sites/assets/locale'\n` +
  demoContent.replace(
    `var ${pkg}Demo = () => {`,
    `
  ${interfaceTemplate}
  var ${pkg}Demo = () => {
    ${translateHookTemplate}
  `
  )

fse
  .outputFile(
    path.join(
      process.cwd(),
      `src/packages/${pkg.toLocaleLowerCase()}/demo.locale.tsx`
    ),
    demoContent,
    'utf8'
  )
  .then(() => {
    shelljs.exec(
      `npx eslint --fix ${path.join(
        process.cwd(),
        `src/packages/${pkg.toLocaleLowerCase()}/demo.locale.tsx`
      )}`
    )
  })
