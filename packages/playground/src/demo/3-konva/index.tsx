import { useEffect, useRef, useState } from 'react'

import { App, Image, Rect } from 'leafer-ui'
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

    const image = new Image({
      url: 'https://konvajs.org/assets/lion.png',
      width: 11
    })

    app.tree.add(image)

    console.log(image.height)

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
