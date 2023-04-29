import { EVENT_REFRESH, eventService, workspace } from '@hawtio/react'
import { TreeViewDataItem } from '@patternfly/react-core'
import { MemoryIcon, MicrochipIcon, MonitoringIcon, RunningIcon } from '@patternfly/react-icons'
import React, { createContext, useEffect, useState } from 'react'
import { pluginName, pluginTitle } from './globals'
import { preferencesService } from './preferences-service'

type CustomNode = TreeViewDataItem & {
  mbean?: string
}

/**
 * Custom React hook for using the plugin-specific custom MBean tree.
 */
export function useCustomTree() {
  const [tree, setTree] = useState<CustomNode[]>([])
  const [loaded, setLoaded] = useState(false)
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null)

  useEffect(() => {
    const loadTree = async () => {
      const tree = await populateTree()
      setTree(tree)
      setLoaded(true)
    }
    loadTree()

    const listener = () => {
      setLoaded(false)
      loadTree()
    }
    eventService.onRefresh(listener)

    return () => eventService.removeListener(EVENT_REFRESH, listener)
  }, [])

  return { tree, loaded, selectedNode, setSelectedNode }
}

async function populateTree(): Promise<CustomNode[]> {
  const domain = preferencesService.loadDomain()
  const tree = await workspace.getTree()
  const target = tree.findDescendant(node => node.name === domain)
  if (!target) {
    return []
  }

  const root: CustomNode = {
    name: pluginTitle,
    id: pluginName,
    mbean: domain,
    icon: React.createElement(MonitoringIcon),
    defaultExpanded: true,
    children: [],
  }
  target.children?.forEach(child => {
    const node: CustomNode = {
      name: child.name,
      id: child.name.replace(/\s/, '-'),
      mbean: child.objectName,
    }
    switch (child.name) {
      case 'Memory':
        node.icon = React.createElement(MemoryIcon)
        root.children?.push(node)
        break
      case 'OperatingSystem':
        node.icon = React.createElement(MicrochipIcon)
        root.children?.push(node)
        break
      case 'Threading':
        node.icon = React.createElement(RunningIcon)
        root.children?.push(node)
        break
      default:
    }
  })

  return [root]
}

type CustomTreeContext = {
  tree: CustomNode[]
  selectedNode: CustomNode | null
  setSelectedNode: (selected: CustomNode | null) => void
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const CustomTreeContext = createContext<CustomTreeContext>({
  tree: [],
  selectedNode: null,
  setSelectedNode: () => {
    // no-op
  },
})
