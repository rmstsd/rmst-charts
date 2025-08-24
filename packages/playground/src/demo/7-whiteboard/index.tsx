import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import WhiteboardEditor from './whiteboardEditor'
import { WbEditorContext } from './context'

import ToolBar from './ToolBar'
import InfoRightPanel from './Panels/InfoRightPanel'

import { isProd } from '@/utils'

import './style.less'
import LeftPanel from './Panels/LeftPanel'

const Whiteboard = function Whiteboard() {
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
        <main className="flex h-full">
          <LeftPanel />

          <div className="wb-center-section flex-grow h-full relative border">
            <div className="whiteboard-canvas h-full" ref={domRef}></div>

            <ToolBar />
          </div>

          <InfoRightPanel />
        </main>
      </div>
    </WbEditorContext.Provider>
  )

  return wbApp
}

export default Whiteboard
