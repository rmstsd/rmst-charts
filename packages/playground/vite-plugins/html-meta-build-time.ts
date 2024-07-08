import type { Plugin } from 'vite'

export default function htmlMetaBuildTime(): Plugin {
  return {
    name: 'html-meta-build-time',
    transformIndexHtml(html) {
      return html.replace(
        /<meta name="buildTime" content="(.*?)" \/>/,
        `<meta name="buildTime" content="${Date.now()}" />`
      )
    }
  }
}
