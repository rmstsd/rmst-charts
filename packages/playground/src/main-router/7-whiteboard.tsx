import LayoutView from '@/components/LayoutView/LayoutView'
import { IRouteObject } from './router'
import Whiteboard from '@/demo/7-whiteboard'

const whiteboardRouteConfig: IRouteObject = {
  path: '/whiteboard',
  element: <LayoutView />,
  uiConfig: { title: '白板' },
  children: [{ path: 'wb', element: <Whiteboard /> }]
}

export default whiteboardRouteConfig
