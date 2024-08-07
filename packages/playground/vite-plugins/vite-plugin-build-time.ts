import type { Plugin } from 'vite'

export default function buildTime(): Plugin {
  return {
    name: 'vite-plugin-build-time',
    transform(code, id) {
      const dynamicValue = new Date().toLocaleString('zh-Hans-CN', {
        timeZone: 'Asia/Shanghai',
        dateStyle: 'short',
        timeStyle: 'short'
      })
      const updatedCode = code.replace('__Build_Time__', JSON.stringify(dynamicValue.replace(/\//g, '-')))

      return {
        code: updatedCode,
        map: null
      }
    }
  }
}
