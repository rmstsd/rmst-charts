import { RefObject, useEffect, useRef, useState } from 'react'
import { Stage } from 'rmst-render'

export const useEffectStage = (containerRef: RefObject<HTMLDivElement>, cb: (stage: Stage) => void) => {
  const [stage, setStage] = useState<Stage>()

  useEffect(() => {
    const stage = new Stage({ container: containerRef.current })
    setStage(stage)

    cb(stage)

    return () => {
      stage.dispose()
    }
  }, [])

  return stage
}
