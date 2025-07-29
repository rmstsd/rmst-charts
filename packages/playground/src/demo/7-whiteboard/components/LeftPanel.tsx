import { useEffect, useState } from 'react'
import { useWbEditor } from '../context'
import { UiBase } from 'rmst-render'
import { isProd } from '@/utils'

export default function LeftPanel() {
  const { wbEditor } = useWbEditor()
  const [list, setList] = useState<UiBase[]>([])

  useEffect(() => {
    const un = wbEditor.eventEmitter.on('render', () => {
      setList([...wbEditor.graphLayer.children])
    })

    return un
  }, [wbEditor])

  if (isProd) {
    return null
  }

  return (
    <div className="left-panel flex-shrink-0" style={{ width: 180 }}>
      {list.map(item => (
        <div key={item.id} className="left-panel-item text-sm py-1">
          {item.id}
        </div>
      ))}
    </div>
  )
}
