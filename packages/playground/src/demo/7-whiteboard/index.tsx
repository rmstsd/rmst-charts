import { useEffect, useMemo, useRef, useState } from 'react'
import WhiteboardEditor from './whiteboardEditor'
import clsx from 'clsx'
import { ToolEnum } from './class/ToolManager/constant'
import { round } from 'es-toolkit'
import { WbEditorContext } from './context'
import InfoRightPanel from './InfoRightPanel'

import './style.less'
import { observer } from 'mobx-react-lite'

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

  return (
    <WbEditorContext.Provider value={wbEditorContextValue}>
      <div className="whiteboard-app">
        <div className="tools-bar flex gap-2 absolute z-50 shadow-lg p-2 left-0 right-0 mx-auto w-fit rounded-lg bg-white">
          {ToolEnum.items.map(item => (
            <button
              key={item.key}
              className={clsx(wbEditor.toolManager.currentTool === item.key && 'bg-red-200')}
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
})

export default Whiteboard
