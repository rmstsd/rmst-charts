import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { round } from 'es-toolkit'
import WhiteboardEditor from './whiteboardEditor'
import { ToolEnum } from './class/ToolManager/constant'
import { WbEditorContext } from './context'
import InfoRightPanel from './InfoRightPanel'

import { isDev, isProd } from '@/utils'

import './style.less'

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
        <div className="tools-bar flex gap-2 absolute z-50 shadow-lg p-2 left-0 top-2 border right-0 mx-auto w-fit rounded-lg bg-white">
          {ToolEnum.items.map(item => (
            <button
              key={item.key}
              className={clsx('tool-btn', wbEditor.toolManager.currentTool === item.key && 'selected')}
              onClick={() => wbEditor.toolManager.switchTool(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <main className="flex h-full">
          <div className="whiteboard-canvas flex-grow h-full relative border" ref={domRef}></div>

          <div className="absolute bg-white shadow-xl rounded-lg p-2 bottom-0 left-0 border flex gap-1 items-center">
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

  if (isDev) {
    return wbApp
  }

  return createPortal(wbApp, document.body)
})

export default Whiteboard
