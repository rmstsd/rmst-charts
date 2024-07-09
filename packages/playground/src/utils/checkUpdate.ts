import { Modal } from 'antd'
import { isDev } from '.'

const buildTimeMeta = document.querySelector('meta[name="buildTime"]')

;(() => {
  if (isDev) {
    return
  }

  cu()
  const timer = setInterval(cu, 30000)

  function cu() {
    fetch('/', { cache: 'no-cache' }).then(res => {
      res.text().then(t => {
        const hostTime = buildTimeMeta.getAttribute('content')

        const parser = new DOMParser()
        const doc = parser.parseFromString(t, 'text/html')
        const remoteTime = doc.querySelector('meta[name="buildTime"]').getAttribute('content')

        const hasUpdated = hostTime !== remoteTime

        if (hasUpdated) {
          clearInterval(timer)

          Modal.confirm({
            title: '有更新, 是否刷新后体验最新版?',
            okText: '刷新',
            cancelText: '取消',
            onOk() {
              window.location.reload()
            }
          })
        }
      })
    })
  }
})()
