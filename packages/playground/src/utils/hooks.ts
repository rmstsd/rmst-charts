import { RefObject, useEffect } from 'react'
import { Stage } from 'rmst-render'

export const useEffectStage = (containerRef: RefObject<HTMLDivElement>, cb: (stage: Stage) => void) => {
  useEffect(() => {
    const stage = new Stage({ container: containerRef.current })

    cb(stage)

    return () => {
      stage.dispose()
    }
  }, [])
}
