import { isNil } from 'es-toolkit'
import { useLayoutEffect, useRef } from 'react'

interface WbInputNumber {
  value?: number | string
  onChange?: (val: number) => void
}

export const WbInputNumber = (props: WbInputNumber) => {
  const { value, onChange } = props

  const inputRef = useRef<HTMLInputElement>()

  useLayoutEffect(() => {
    setInputValue(getValue(value))
  }, [value])

  const setInputValue = value => {
    inputRef.current.value = value
  }

  return (
    <input
      className="px-1 py-[4px] border border-gray-300 rounded-md hover:border-gray-500 focus:outline-blue-500 "
      style={{ width: '100%' }}
      ref={inputRef}
      onBlur={evt => {
        let val = Number(evt.target.value)

        if (isNaN(val)) {
          setInputValue(value)
        } else {
          if (val === value) {
            return
          }

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
