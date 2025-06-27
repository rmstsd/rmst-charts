import { useEffect, useRef, useState } from 'react'

import { App, Rect } from 'leafer-ui'
import '@leafer-in/editor'

export default function Lor() {
  const containerRef = useRef()

  const [app, setApp] = useState<App>()

  useEffect(() => {
    const app = new App({
      view: containerRef.current,
      editor: {
        editSize: 'size'
      }
    })

    setApp(app)

    app.tree.add(Rect.one({ editable: true, fill: '#FEB027', stroke: 'red', strokeWidth: 4 }, 50, 50, 200, 100))
    app.tree.add(Rect.one({ editable: true, fill: '#FFE04B', stroke: 'red', strokeWidth: 4 }, 300, 100))

    return () => {
      app.destroy()
    }
  }, [])

  return (
    <div>
      <button
        onClick={() => {
          console.log(app.tree.toJSON().children[0])
        }}
      >
        打印json
      </button>
      <br />
      <div className="border" style={{ width: 800, height: 600 }} ref={containerRef}></div>
    </div>
  )
}
