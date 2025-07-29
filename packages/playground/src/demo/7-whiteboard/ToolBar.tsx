import clsx from 'clsx'
import { ToolEnum, ToolEnumKey } from './class/ToolManager/constant'
import { useWbEditor } from './context'
import { useEffect, useState } from 'react'

export default function ToolBar() {
  const { wbEditor } = useWbEditor()
  const [currentTool, setCurrentTool] = useState<ToolEnumKey>()

  useEffect(() => {
    setCurrentTool(wbEditor.toolManager.currentTool)
    const off = wbEditor.toolManager.eventEmitter.on('switchToolChange', tool => {
      setCurrentTool(tool)
    })

    return off
  }, [wbEditor])

  return (
    <div className="tools-bar flex gap-2 absolute z-50 shadow-lg p-2 left-0 bottom-2 border right-0 mx-auto w-fit rounded-lg bg-white">
      {ToolEnum.items.map(item => (
        <button
          key={item.key}
          className={clsx('tool-btn', currentTool === item.key && 'selected')}
          onClick={() => wbEditor.toolManager.switchTool(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
