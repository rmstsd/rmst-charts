import colorAlpha from 'color-alpha'
import oc from 'open-color' // https://yeun.github.io/open-color/

export const primaryColor = oc.indigo[9]
export const primaryAlphaColor = colorAlpha(primaryColor, 0.1)

export const defaultGraphFillColor = oc.gray[2]
export const defaultGraphPencilColor = oc.gray[7]
