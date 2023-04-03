import { HawtioPlugin } from '@hawtio/react';
import { customTree } from './custom-tree';
import { simple } from './simple';

export const plugin: HawtioPlugin = () => {
  simple()
  customTree()
}
