import { RefObject, useEffect, useRef, useState } from 'react'
import { useCallback } from 'react'

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

export function useEffectEvent<T extends (...args: any[]) => any>(callback: T): T {
  // 用 ref 保存最新的函数引用
  const callbackRef = useRef(callback)

  callbackRef.current = callback

  const stableCallback = useCallback((...args: Parameters<T>) => {
    // 调用最新的函数引用
    return callbackRef.current(...args)
  }, [])

  return stableCallback as T
}
