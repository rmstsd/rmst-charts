import clsx from 'clsx'

interface SelectColorProps {
  value?: string
  onChange?: (value: string) => void
  options?: string[]
}

export function SelectColor(props: SelectColorProps) {
  const { value, onChange, options } = props

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(item => (
        <div
          className={clsx('cursor-pointer shrink-0 w-4 h-4 rounded-sm border border-transparent', {
            selected: item === value
          })}
          onClick={() => {
            if (item === value) {
              return
            }

            onChange?.(item)
          }}
          key={item}
          style={{ backgroundColor: item }}
        ></div>
      ))}
    </div>
  )
}
