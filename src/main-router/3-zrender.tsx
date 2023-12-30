import LayoutView from '@/components/LayoutView/LayoutView'

import { IRouteObject } from './router'

import QuickStart from '@/demo/3-zrender/QuickStart'
import RectOver from '@/demo/3-zrender/RectOver'
import DragOverOther from '@/demo/3-zrender/DragOverOther'

const rmstRenderRouteConfig: IRouteObject = {
  path: '/zrender',
  element: <LayoutView />,
  uiConfig: { title: 'zrender', hidden: import.meta.env.PROD },
  children: [
    { path: 'QuickStart', element: <QuickStart /> },
    { path: 'RectOver', element: <RectOver /> },
    { path: 'drag-over-other', element: <DragOverOther /> }
  ]
}

export default rmstRenderRouteConfig
