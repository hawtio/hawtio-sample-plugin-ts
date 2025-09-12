import { HawtioPlugin, hawtio, helpRegistry, preferencesRegistry } from '@hawtio/react'
import { AiPreferences } from './AiPreferences'
import { log, pluginName, pluginPath, pluginTitle } from './globals'
import help from './help.md'
import { Jmx } from './Jmx'

export const ai: HawtioPlugin = () => {
  log.info('Loading', pluginName)

  hawtio.addPlugin({
    id: pluginName,
    title: pluginTitle,
    path: pluginPath,
    component: Jmx,
    isActive: async () => true
  })

  helpRegistry.add(pluginName, pluginTitle, help, 103)
  preferencesRegistry.add(pluginName, pluginTitle, AiPreferences, 103)
}
