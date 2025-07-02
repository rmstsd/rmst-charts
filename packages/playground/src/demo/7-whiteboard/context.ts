import { createContext, useContext } from 'react'
import WhiteboardEditor from './whiteboardEditor'

export const WbEditorContext = createContext<{ wbEditor: WhiteboardEditor }>(null)

export const useWbEditor = () => useContext(WbEditorContext)
