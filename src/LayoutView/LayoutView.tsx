import { Divider, Layout, Menu, MenuProps } from 'antd'
import { Outlet, useLocation, useMatches, useNavigate, matchRoutes } from 'react-router-dom'
import { IRouteObject, routes } from '../main-router/router'

const convertToAntdData = (array: IRouteObject[], recur: boolean): MenuProps['items'] => {
  return array
    .filter(item => !item.uiConfig?.hidden)
    .map(item =>
      Object.assign(
        { label: item.uiConfig?.title || item.path, key: item.path },
        recur && item.children && { children: convertToAntdData(item.children, recur) }
      )
    )
}

const LayoutView = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const mRoutes = matchRoutes(routes, location.pathname)

  const routePathArray = mRoutes.map(item => item.route.path)
  const [mainPath, erPath] = routePathArray

  const headerItems: MenuProps['items'] = convertToAntdData(routes, false)
  const siderItems: MenuProps['items'] = convertToAntdData(
    routes.find(item => item.path === mainPath).children,
    false
  )

  const onHeaderMenuClick = info => {
    const { key, keyPath } = info
    const erPath = routes.find(item => item.path === key).children[0].path
    navigate(key + '/' + erPath)
  }

  const onErMenuClick = info => {
    const { key, keyPath } = info
    navigate(mainPath + '/' + key)
  }

  return (
    <Layout style={{ height: '100%', backgroundColor: 'white' }}>
      <Layout.Header style={{ backgroundColor: 'transparent', display: 'flex', padding: 0 }}>
        <div style={{ width: 200 }}></div>
        <Menu
          mode="horizontal"
          selectedKeys={routePathArray}
          items={headerItems}
          onClick={onHeaderMenuClick}
          style={{ border: 'none', flexGrow: 1 }}
        />
      </Layout.Header>

      <Divider style={{ margin: 0 }} />
      <Layout style={{ backgroundColor: '#f9f9f9' }}>
        <Layout.Sider
          style={{ overflow: 'auto', height: '100%', maxWidth: 'initial', minWidth: 'initial' }}
          theme="light"
        >
          <Menu mode="inline" selectedKeys={routePathArray} items={siderItems} onClick={onErMenuClick} />
        </Layout.Sider>

        <Layout.Content style={{ margin: 10, padding: 10, borderRadius: 5, backgroundColor: '#fff' }}>
          <Outlet />
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

export default LayoutView
