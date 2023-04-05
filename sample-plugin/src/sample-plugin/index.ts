import { HawtioPlugin } from '@hawtio/react'
import { customTree } from './custom-tree'
import { simple } from './simple'

/**
 * The entry function for the plugin exposed to Hawtio.
 *
 * The default name for the function is "plugin". If you want to use the name other
 * than the default one, you need to specify the name using {HawtioPlugin#setPluginEntry()}
 * method when registering the plugin to JMX MBean server.
 *
 * <code>
 * HawtioPlugin plugin = new HawtioPlugin();
 * plugin.setPluginEntry("registerMyPlugin");
 * </code>
 *
 * @see src/main/java/io/hawt/examples/sampleplugin/PluginContextListener.java
 */
export const plugin: HawtioPlugin = () => {
  simple()
  customTree()
}
