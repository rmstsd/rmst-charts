import { useEffectEvent } from '@/utils/hooks'
import { isNil } from 'es-toolkit'
import { useLayoutEffect, useRef, useState } from 'react'

export interface WbInputNumberProps {
  value?: number | string
  onChange?: (val: number) => void
}

export const WbInputNumber = (props: WbInputNumberProps) => {
  const { value, onChange } = props

  const inputRef = useRef<HTMLInputElement>()
  const setFocusedRef = useRef(false)

  const getProps = useEffectEvent(() => props)

  useLayoutEffect(() => {
    if (!setFocusedRef.current) {
      setInputValue(getValue(getProps().value))
    }
  }, [value])

  const setInputValue = value => {
    inputRef.current.value = value
  }

  return (
    <input
      className="px-1 py-[4px] border border-gray-300 rounded-md hover:border-gray-500 focus:outline-blue-500 "
      style={{ width: '100%' }}
      ref={inputRef}
      type="number"
      onFocus={() => {
        setFocusedRef.current = true
      }}
      onKeyDown={evt => {
        if (evt.key === 'Enter') {
          evt.preventDefault()
          inputRef.current.blur()
        }
      }}
      onBlur={evt => {
        setFocusedRef.current = false
        const nativeValue = evt.target.value
        // todo 处理清空值的情况

        let val = Number(nativeValue)

        if (isNaN(val)) {
          setInputValue(value)
        } else {
          setInputValue(value)

          // 对比新旧值 才 发出 onChange 事件?
          onChange?.(val)
        }
      }}
    />
  )
}

const getValue = value => {
  if (isNil(value)) {
    return null
  }

  if (!isNaN(Number(value))) {
    return value.toString()
  }

  return value as string
}
