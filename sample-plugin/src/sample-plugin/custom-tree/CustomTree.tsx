import { AttributeValues, jolokiaService } from '@hawtio/react'
import { ChartDonutThreshold, ChartDonutUtilization, ChartPie } from '@patternfly/react-charts'
import {
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateIcon,
  PageGroup,
  PageSection,
  Spinner,
  Text,
  Title,
  TreeView,
  TreeViewDataItem,
} from '@patternfly/react-core'
import { CubesIcon } from '@patternfly/react-icons'
import { IRequest, IResponse, IResponseFn } from 'jolokia.js'
import React, { useContext, useEffect, useState } from 'react'
import Split from 'react-split'
import './CustomTree.css'
import { CustomTreeContext, useCustomTree } from './context'
import { log } from './globals'

export const CustomTree: React.FunctionComponent = () => {
  const { tree, loaded, selectedNode, setSelectedNode } = useCustomTree()

  if (!loaded) {
    return (
      <PageSection>
        <Spinner isSVG aria-label='Loading custom tree' />
      </PageSection>
    )
  }

  // You can use Split.js to implement a split view.
  // For more information, see: https://split.js.org/
  return (
    <CustomTreeContext.Provider value={{ tree, selectedNode, setSelectedNode }}>
      <Split className='custom-tree-split' sizes={[30, 70]} minSize={200} gutterSize={5}>
        <div>
          <CustomTreeTreeView />
        </div>
        <div>
          <CustomTreeContent />
        </div>
      </Split>
    </CustomTreeContext.Provider>
  )
}

const CustomTreeTreeView: React.FunctionComponent = () => {
  const { tree, selectedNode, setSelectedNode } = useContext(CustomTreeContext)

  const onSelect = (_: React.MouseEvent<Element, MouseEvent>, item: TreeViewDataItem) => {
    setSelectedNode(item)
  }

  return (
    <TreeView
      id='custom-tree-tree-view'
      data={tree}
      onSelect={onSelect}
      hasSelectableNodes={true}
      activeItems={selectedNode ? [selectedNode] : []}
    />
  )
}

const CustomTreeContent: React.FunctionComponent = () => {
  const { selectedNode } = useContext(CustomTreeContext)

  if (!selectedNode) {
    return (
      <PageSection variant='light' isFilled>
        <EmptyState variant='full'>
          <EmptyStateIcon icon={CubesIcon} />
          <Title headingLevel='h1' size='lg'>
            Select Node
          </Title>
        </EmptyState>
      </PageSection>
    )
  }

  let customTreeContent = null
  switch (selectedNode.name) {
    case 'Memory':
      customTreeContent = <MemoryView />
      break
    case 'OperatingSystem':
      customTreeContent = <OSView />
      break
    case 'Threading':
      customTreeContent = <ThreadsView />
      break
    default:
  }

  return (
    <React.Fragment>
      <PageGroup>
        <PageSection variant='light' className='custom-tree-content-header'>
          <Title headingLevel='h1'>{selectedNode.name}</Title>
          <Text component='small'>{selectedNode.mbean}</Text>
        </PageSection>
      </PageGroup>
      <PageSection variant='light' className='custom-tree-content-main'>
        {customTreeContent}
      </PageSection>
    </React.Fragment>
  )
}

type MemoryUsage = {
  init: number
  used: number
  committed: number
  max: number
}

const zeroMemoryUsage: MemoryUsage = { init: 0, used: 0, committed: 0, max: 0 }

const MemoryView: React.FunctionComponent = () => {
  const { selectedNode } = useContext(CustomTreeContext)
  const [isReading, setIsReading] = useState(true)
  const [heap, setHeap] = useState<MemoryUsage>(zeroMemoryUsage)
  const [nonHeap, setNonHeap] = useState<MemoryUsage>(zeroMemoryUsage)

  useEffect(() => {
    if (!selectedNode || selectedNode.name !== 'Memory' || !selectedNode.mbean) {
      return
    }

    const { mbean } = selectedNode

    const setAttributes = (attrs: AttributeValues) => {
      setHeap(attrs['HeapMemoryUsage'] as MemoryUsage)
      setNonHeap(attrs['NonHeapMemoryUsage'] as MemoryUsage)
      setIsReading(false)
    }

    const readAttributes = async () => {
      const attrs = await jolokiaService.readAttributes(mbean)
      setAttributes(attrs)
    }
    readAttributes()

    let handle: number | null = null
    const register = async (request: IRequest, callback: IResponseFn) => {
      handle = await jolokiaService.register(request, callback)
      log.debug('Register request: handle =', handle)
    }
    register({ type: 'read', mbean, attribute: ['HeapMemoryUsage', 'NonHeapMemoryUsage'] }, (response: IResponse) => {
      log.debug('Scheduler - Attributes:', response.value)
      const attrs = response.value as AttributeValues
      setAttributes(attrs)
    })

    return () => {
      handle && jolokiaService.unregister(handle)
    }
  }, [selectedNode])

  if (!selectedNode || selectedNode.name !== 'Memory') {
    return null
  }

  if (isReading) {
    return (
      <Card isPlain>
        <CardBody>
          <Text component='p'>Reading attributes...</Text>
        </CardBody>
      </Card>
    )
  }

  type MemoryPieProps = {
    title: string
    data: { x: string; y: number }[]
    legendData: { name: string }[]
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const MemoryPie = ({ title, data, legendData }: MemoryPieProps) => (
    <Card isPlain>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        <div style={{ height: '230px', width: '350px' }}>
          <ChartPie
            constrainToVisibleArea
            data={data}
            height={230}
            labels={({ datum }) => `${datum.x}: ${datum.y}`}
            legendData={legendData}
            legendOrientation='vertical'
            legendPosition='right'
            name={title}
            padding={{
              bottom: 20,
              left: 20,
              right: 140, // Adjusted to accommodate legend
              top: 20,
            }}
            width={350}
          />
        </div>
      </CardBody>
    </Card>
  )

  const toMB = (n: number) => (n / (1000 * 1000)).toFixed(2)
  type MemoryUtilizationProps = {
    title: string
    data: MemoryUsage
  }
  const MemoryUtilization = ({ title, data }: MemoryUtilizationProps) => {
    const max = Math.max(data.committed, data.max)
    const thresholdData = [
      { x: 'init', y: (data.init * 100) / max },
      { x: 'committed', y: (data.committed * 100) / max },
    ]
    if (data.max >= 0) {
      thresholdData.push({ x: 'max', y: (data.max * 100) / max })
    }
    const utilData = { x: 'used', y: (data.used * 100) / max }
    const legendData = [
      { name: `used: ${toMB(data.used)} MB` },
      { name: `init: ${toMB(data.init)} MB` },
      { name: `committed: ${toMB(data.committed)} MB` },
    ]
    if (data.max >= 0) {
      legendData.push({ name: `max: ${toMB(data.max)} MB` })
    }
    return (
      <Card isPlain>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <div style={{ height: '230px', width: '500px' }}>
            <ChartDonutThreshold
              constrainToVisibleArea
              data={thresholdData}
              labels={({ datum }) => (datum.x ? datum.x : null)}
              name={title}
              padding={{
                bottom: 20,
                left: 20,
                right: 290, // Adjusted to accommodate legend
                top: 20,
              }}
              width={500}
            >
              <ChartDonutUtilization
                data={utilData}
                labels={({ datum }) => (datum.x ? `${datum.x}: ${datum.y.toFixed(2)}%` : null)}
                legendData={legendData}
                legendOrientation='vertical'
                subTitle={`of ${toMB(max)} MB`}
                title={`${((data.used * 100) / max).toFixed(2)}%`}
                thresholds={[{ value: 60 }, { value: 90 }]}
              />
            </ChartDonutThreshold>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <React.Fragment>
      <MemoryUtilization title='Heap Memory Usage' data={heap} />
      <MemoryUtilization title='Non-Heap Memory Usage' data={nonHeap} />
    </React.Fragment>
  )
}

const OSView: React.FunctionComponent = () => {
  const { selectedNode } = useContext(CustomTreeContext)

  if (!selectedNode || selectedNode.name !== 'OperatingSystem') {
    return null
  }

  const Processor = () => {
    return <Card isPlain></Card>
  }

  return (
    <React.Fragment>
      <Processor />
      <Processor />
    </React.Fragment>
  )
}

const ThreadsView: React.FunctionComponent = () => {
  const { selectedNode } = useContext(CustomTreeContext)

  if (!selectedNode || selectedNode.name !== 'Threading') {
    return null
  }

  const Threads = () => {
    return <Card isPlain></Card>
  }

  return (
    <React.Fragment>
      <Threads />
      <Threads />
    </React.Fragment>
  )
}
