import { AttributeValues, eventService, HawtioEmptyCard, HawtioLoadingCard, PluginNodeSelectionContext } from '@hawtio/react'
import { Button, Drawer, DrawerContent, DrawerContentBody, Panel, Toolbar, ToolbarContent, ToolbarItem } from '@patternfly/react-core'
import { MonitoringIcon } from '@patternfly/react-icons'
import { Table, Tbody, Td, Th, Thead, ThProps, Tr } from '@patternfly/react-table'
import Jolokia from 'jolokia.js'
import React, { useContext, useEffect, useState } from 'react'
import { aiService } from '../ai-service'
import { log } from '../globals'
import { isObject, objectSorter } from '../util'
import { attributeService } from './attribute-service'
import { AttributeModal } from './AttributeModal'
import './AttributeTable.css'

export const Attributes: React.FC = () => {
  const { selectedNode } = useContext(PluginNodeSelectionContext)
  const [attributes, setAttributes] = useState<AttributeValues>({})
  const [isReading, setIsReading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAttributeSelected, setIsAttributeSelected] = useState(false)
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState({ name: '', value: '' })
  const [reload, setReload] = useState(false)
  const [aiMessage, setAiMessage] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!selectedNode || !selectedNode.mbean || !selectedNode.objectName) {
      return
    }

    setIsReading(true)
    const { objectName } = selectedNode
    attributeService.readWithCallback(objectName, attrs => {
      setAttributes(attrs)
      setIsReading(false)
    })

    attributeService.register({ type: 'read', mbean: objectName }, response => {
      if (!Jolokia.isError(response)) {
        log.debug('Scheduler - Attributes:', response.value)
        setAttributes(response.value as AttributeValues)
      }
    })

    return () => attributeService.unregisterAll()
  }, [selectedNode])

  useEffect(() => {
    if (!selectedNode || !selectedNode.mbean || !selectedNode.objectName || !reload) {
      return
    }

    setIsReading(true)
    const { objectName } = selectedNode
    attributeService.readWithCallback(objectName, attrs => {
      setAttributes(attrs)
      setIsReading(false)
    })

    setReload(false)
  }, [selectedNode, reload])

  if (!selectedNode || !selectedNode.mbean || !selectedNode.objectName) {
    return null
  }

  if (isReading) {
    return <HawtioLoadingCard />
  }

  const rows: { name: string; value: string }[] = Object.entries(attributes).map(([name, value]) => ({
    name: name,
    value: isObject(value) ? JSON.stringify(value) : String(value),
  }))

  if (rows.length === 0) {
    return <HawtioEmptyCard message='This MBean has no attributes.' />
  }

  const selectAttribute = (attribute: { name: string; value: string }) => {
    setSelected(attribute)
    setIsAttributeSelected(true)
    if (!isModalOpen) {
      setIsModalOpen(true)
    }
  }

  const getSortParams = (): ThProps['sort'] => ({
    sortBy: {
      index: 0,
      direction: sortDirection,
      defaultDirection: 'asc', // starting sort direction when first sorting a column. Defaults to 'asc'
    },
    onSort: (_event, _index, direction) => {
      setSortDirection(direction)
    },
    columnIndex: 0,
  })

  const panelContent = (
    <AttributeModal
      isAttributeSelected={isAttributeSelected}
      onClose={() => {
        setIsModalOpen(false)
        setIsAttributeSelected(false)
      }}
      onUpdate={() => setReload(true)}
      input={selected}
      aiMessage={aiMessage}
    />
  )

  const attributesTable = (
    <div id='attribute-table-with-panel'>
      <AiJmxToolbar
        attributes={attributes}
        setAiMessage={setAiMessage}
        onDiagnosisFinished={() => setIsModalOpen(true)}
      />
      <Table aria-label='Attributes' variant='compact'>
        <Thead>
          <Tr>
            <Th sort={getSortParams()}>Attribute</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows
            .sort((a, b) => objectSorter(a.name, b.name, sortDirection === 'desc'))
            .map((att, index) => (
              <Tr
                key={att.name + '-' + index}
                isClickable
                isRowSelected={selected.name === att.name}
                onRowClick={() => selectAttribute(att)}
              >
                <Td>{att.name}</Td>
                <Td>{att.value}</Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </div>
  )
  return (
    <Panel>
      <Drawer isExpanded={isModalOpen} className={'pf-m-inline-on-2xl'}>
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody hasPadding> {attributesTable}</DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </Panel>
  )
}

const AiJmxToolbar: React.FC<{
  attributes: AttributeValues
  setAiMessage: (message: string) => void
  onDiagnosisFinished: () => void
}> = ({ attributes, setAiMessage, onDiagnosisFinished }) => {
  const { selectedNode } = useContext(PluginNodeSelectionContext)

  if (!selectedNode || !selectedNode.mbean || !selectedNode.objectName) {
    return null
  }
  const { objectName } = selectedNode

  const diagnose = () => {
    eventService.notify({ type: 'info', message: 'Diagnosing...' })
    const attrsValue = JSON.stringify(attributes)
    log.debug('Attributes:', attrsValue)
    aiService.diagnose(objectName, attrsValue).then(response => {
      if (typeof response === 'string') {
        eventService.notify({ type: 'danger', message: response })
        return
      }
      const message = response.content as string
      if (!message) {
        eventService.notify({ type: 'warning', message: 'No diagnosis available' })
        return
      }
      log.debug('Diagnosis:', message)
      eventService.notify({ type: 'success', message: 'Diagnosis completed' })
      setAiMessage(message)
      onDiagnosisFinished()
    })
  }

  return (
    <Toolbar id='ai-jmx-toolbar'>
      <ToolbarContent>
        <ToolbarItem>
          <Button
            variant='primary'
            size='sm'
            icon={<MonitoringIcon />}
            onClick={diagnose}
          >
            &nbsp;Diagnose
          </Button>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  )
}
