import { HawtioPlugin, hawtio, helpRegistry, preferencesRegistry, workspace } from '@hawtio/react'
import { CustomTree } from './CustomTree'
import { CustomTreePreferences } from './CustomTreePreferences'
import { log, pluginName, pluginPath, pluginTitle } from './globals'
import help from './help.md'
import { preferencesService } from './preferences-service'

export const customTree: HawtioPlugin = () => {
  log.info('Loading', pluginName)

  hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: CustomTree,
    isActive: () => {
      // You can enable the plugin only when a specific domain is present in the workspace
      const domain = preferencesService.loadDomain()
      return workspace.treeContainsDomainAndProperties(domain)
    },
  })

  helpRegistry.add(pluginName, pluginTitle, help, 102)
  preferencesRegistry.add(pluginName, pluginTitle, CustomTreePreferences, 102)
}
