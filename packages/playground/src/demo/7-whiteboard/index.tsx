import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import clsx from 'clsx'
import { round } from 'es-toolkit'
import WhiteboardEditor from './whiteboardEditor'
import { WbEditorContext } from './context'

import ToolBar from './ToolBar'
import InfoRightPanel from './InfoRightPanel'

import { isProd } from '@/utils'

import './style.less'

// let isProd = false

const Whiteboard = observer(function Whiteboard() {
  const domRef = useRef()
  const [wbEditor, setWbEditor] = useState(() => new WhiteboardEditor())

  useEffect(() => {
    const editor = new WhiteboardEditor()
    setWbEditor(editor)
    editor.init(domRef.current)

    // @ts-ignore
    window.wbEditor = editor

    return () => {
      editor.dispose()
    }
  }, [])

  const wbEditorContextValue = { wbEditor }

  const wbApp = (
    <WbEditorContext.Provider value={wbEditorContextValue}>
      <div className={clsx('whiteboard-app', isProd && 'prod')}>
        <ToolBar />

        <main className="flex h-full">
          <div className="whiteboard-canvas flex-grow h-full relative border" ref={domRef}></div>

          <div className="zoom-container absolute bg-white shadow-xl rounded-lg p-2 bottom-0 left-0 border flex gap-1 items-center">
            <button onClick={() => wbEditor.camera.zoomOut()}>缩小</button>
            <span style={{ width: 90 }} className="text-center">
              zoom: {round(wbEditor.camera.zoom * 100)}%
            </span>
            <button onClick={() => wbEditor.camera.zoomIn()}>放大</button>
            <button onClick={() => wbEditor.camera.zoomToValue(1)}>100%</button>
            <button onClick={() => wbEditor.camera.zoomToFit()}>适应画布</button>
          </div>

          <InfoRightPanel />
        </main>
      </div>
    </WbEditorContext.Provider>
  )

  return wbApp
})

export default Whiteboard
