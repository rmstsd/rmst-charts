import { UiData } from '../shape'

export const normalizedAttrs = (args): UiData => {
  let attrs = {}

  switch (args.length) {
    case 1: {
      const [data] = args
      attrs = data
      break
    }
    case 2: {
      const [key, value] = args
      attrs[key] = value
      break
    }

    default:
      console.log('未实现的参数数量')
      break
  }

  return attrs
}
