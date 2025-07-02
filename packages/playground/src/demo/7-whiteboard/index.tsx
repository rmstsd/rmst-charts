import { useEffect, useMemo, useRef, useState } from 'react'
import WhiteboardEditor from './whiteboardEditor'
import clsx from 'clsx'
import { ToolEnum } from './class/ToolManager/constant'
import { round } from 'es-toolkit'
import { WbEditorContext } from './context'
import InfoRightPanel from './InfoRightPanel'

import './style.less'
import { observer } from 'mobx-react-lite'
import { createPortal } from 'react-dom'
import { isDev, isProd } from '@/utils'

const Whiteboard = observer(function Whiteboard() {
  const domRef = useRef()
  const [wbEditor, setWbEditor] = useState<WhiteboardEditor>(() => new WhiteboardEditor())

  useEffect(() => {
    const editor = new WhiteboardEditor()
    // @ts-ignore
    window.wbEditor = editor

    setWbEditor(editor)
    editor.init(domRef.current)

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

          <div className="absolute bg-white shadow-xl rounded-lg p-2 bottom-0 left-0 border">
            zoom: {round(wbEditor.camera.zoom, 2)}
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
