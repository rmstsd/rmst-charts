import type { Plugin } from 'vite'

export default function buildTime(): Plugin {
  return {
    name: 'vite-plugin-build-time',
    transform(code, id) {
      const dynamicValue = new Date().toLocaleString('en-US', { timeZone: 'Asia/Shanghai' })
      const updatedCode = code.replace('__Build_Time__', JSON.stringify(dynamicValue))

      return {
        code: updatedCode,
        map: null
      }
    }
  }
}
