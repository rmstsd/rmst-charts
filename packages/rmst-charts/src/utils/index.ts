export * from './convert'
import structuredClone from '@ungap/structured-clone'

export const stClone = <T>(value: T): T => {
  return structuredClone(value)
}
