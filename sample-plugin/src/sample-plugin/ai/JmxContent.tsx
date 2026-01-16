import { Chart, JmxContentMBeans, MBeanNode, Operations } from '@hawtio/react'
import {
  Content,
  Divider,
  EmptyState,
  Nav,
  NavItem,
  NavList,
  PageGroup,
  PageSection,
  Title
} from '@patternfly/react-core'
import { CubesIcon } from '@patternfly/react-icons/dist/esm/icons/cubes-icon'
import React, { useContext } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import './JmxContent.css'
import { Attributes, AttributeTable } from './attributes'
import { MBeanTreeContext } from './context'
import { pluginPath } from './globals'

export const JmxContent: React.FC = () => {
  const { selectedNode } = useContext(MBeanTreeContext)
  const { pathname, search } = useLocation()

  if (!selectedNode) {
    return (
      <PageSection hasBodyWrapper={false} isFilled>
        <EmptyState
          headingLevel='h1'
          icon={CubesIcon}
          titleText='Select MBean'
          variant='full'
        />
      </PageSection>
    )
  }

  const mBeanApplicable = (node: MBeanNode) => Boolean(node.objectName)
  const mBeanCollectionApplicable = (node: MBeanNode) => Boolean(node.children?.every(child => child.objectName))
  const hasAnyApplicableMBean = (node: MBeanNode) =>
    Boolean(node.objectName) || Boolean(node.children?.some(child => child.objectName))
  const ALWAYS = (_node: MBeanNode) => true

  const tableSelector = (node: MBeanNode): React.FC => {
    const tablePriorityList: { condition: (node: MBeanNode) => boolean; element: React.FC }[] = [
      { condition: mBeanApplicable, element: Attributes },
      { condition: mBeanCollectionApplicable, element: AttributeTable },
    ]

    return tablePriorityList.find(entry => entry.condition(node))?.element ?? JmxContentMBeans
  }

  const allNavItems = [
    { id: 'attributes', title: 'Attributes', component: tableSelector(selectedNode), isApplicable: ALWAYS },
    { id: 'operations', title: 'Operations', component: Operations, isApplicable: mBeanApplicable },
    { id: 'chart', title: 'Chart', component: Chart, isApplicable: hasAnyApplicableMBean },
  ]

  /* Filter the nav items to those applicable to the selected node */
  const navItems = allNavItems.filter(nav => nav.isApplicable(selectedNode))

  const mbeanNav = (
    <Nav aria-label='MBean Nav' variant="horizontal-subnav">
      <NavList>
        {navItems.map(nav => (
          <NavItem key={nav.id} isActive={pathname === `${pluginPath}/${nav.id}`}>
            <NavLink to={{ pathname: nav.id, search }}>{nav.title}</NavLink>
          </NavItem>
        ))}
      </NavList>
    </Nav>
  )

  const mbeanRoutes = navItems.map(nav => (
    <Route key={nav.id} path={nav.id} element={React.createElement(nav.component)} />
  ))

  return (
    <PageGroup id='jmx-content'>
      <PageSection hasBodyWrapper={false} id='jmx-content-header'>
        <Title headingLevel='h1'>{selectedNode.name}</Title>
        <Content component='small'>{selectedNode.objectName}</Content>
      </PageSection>
      <Divider />
      <PageSection hasBodyWrapper={false} type='tabs' hasShadowBottom>
        {mbeanNav}
      </PageSection>
      <PageSection
        hasBodyWrapper={false}
        id='jmx-content-main'
        padding={{ default: 'noPadding' }}
        hasOverflowScroll
        aria-label='jmx-content-main'
      >
        <Routes>
          {mbeanRoutes}
          <Route key='root' path='/' element={<Navigate to={navItems[0]?.id ?? ''} />} />
        </Routes>
      </PageSection>
    </PageGroup>
  )
}
