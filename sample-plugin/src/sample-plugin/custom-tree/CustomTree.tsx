import { AttributeValues, jolokiaService } from '@hawtio/react'
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartContainer,
  ChartDonutThreshold,
  ChartDonutUtilization,
  ChartGroup,
  ChartLabel,
  ChartLine,
  ChartVoronoiContainer,
} from '@patternfly/react-charts'
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
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

function toMB(n: number) {
  return (n / (1000 * 1000)).toFixed(2)
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
    }

    const readAttributes = async () => {
      const attrs = await jolokiaService.readAttributes(mbean)
      setAttributes(attrs)
      setIsReading(false)
    }
    readAttributes()

    let handle: number | null = null
    const register = async (request: IRequest, callback: IResponseFn) => {
      handle = await jolokiaService.register(request, callback)
      log.debug(selectedNode.name, '- Register request: handle =', handle)
    }
    register({ type: 'read', mbean, attribute: ['HeapMemoryUsage', 'NonHeapMemoryUsage'] }, (response: IResponse) => {
      log.debug(selectedNode.name, '- Scheduler - Attributes:', response.value)
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

type CpuLoadHistory = {
  process: number
  system: number
}[]

const cpuLoadHistorySize = 50
const initialCpuLoadHistory: CpuLoadHistory = Array(cpuLoadHistorySize)
  .fill(0)
  .map(_ => ({ process: 0, system: 0 }))

const OSView: React.FunctionComponent = () => {
  const { selectedNode } = useContext(CustomTreeContext)
  const [isReading, setIsReading] = useState(true)
  const [systemInfo, setSystemInfo] = useState<Record<string, string>>({})
  const [cpuLoadHistory, setCpuLoadHistory] = useState(initialCpuLoadHistory)

  useEffect(() => {
    if (!selectedNode || selectedNode.name !== 'OperatingSystem' || !selectedNode.mbean) {
      return
    }

    const { mbean } = selectedNode

    const updateHistory = (attrs: AttributeValues) => {
      const process = attrs['ProcessCpuLoad'] as number
      const system = attrs['SystemCpuLoad'] as number
      // history is a FIFO queue
      setCpuLoadHistory(history => [...history.slice(1), { process, system }])
    }

    const readAttributes = async () => {
      const attrs = await jolokiaService.readAttributes(mbean)
      setSystemInfo({
        OS: attrs['Name'] as string,
        Architecture: attrs['Arch'] as string,
        'Number of processors': attrs['AvailableProcessors'] as string,
        Memory: `${toMB(attrs['TotalPhysicalMemorySize'] as number)} MB`,
      })
      updateHistory(attrs)
      setIsReading(false)
    }
    readAttributes()

    let handle: number | null = null
    const register = async (request: IRequest, callback: IResponseFn) => {
      handle = await jolokiaService.register(request, callback)
      log.debug(selectedNode.name, '- Register request: handle =', handle)
    }
    register(
      {
        type: 'read',
        mbean,
        attribute: ['ProcessCpuLoad', 'SystemCpuLoad'],
      },
      (response: IResponse) => {
        log.debug(selectedNode.name, '- Scheduler - Attributes:', response.value)
        const attrs = response.value as AttributeValues
        updateHistory(attrs)
      },
    )

    return () => {
      handle && jolokiaService.unregister(handle)
    }
  }, [selectedNode])

  if (!selectedNode || selectedNode.name !== 'OperatingSystem' || !selectedNode.mbean) {
    return null
  }

  if (isReading) {
    return <ReadingCard />
  }

  const SystemInfo = ({ info }: { info: Record<string, string> }) => {
    return (
      <Card isPlain>
        <CardTitle>System info</CardTitle>
        <CardBody>
          <DescriptionList columnModifier={{ default: '3Col' }}>
            {Object.entries(info).map(([key, value], index) => (
              <DescriptionListGroup key={`system-info-${index}`}>
                <DescriptionListTerm>{key}</DescriptionListTerm>
                <DescriptionListDescription>{value}</DescriptionListDescription>
              </DescriptionListGroup>
            ))}
          </DescriptionList>
        </CardBody>
      </Card>
    )
  }

  const CpuSparkline = ({ title, color, data }: { title: string; color: string; data: unknown[] }) => {
    return (
      <div style={{ marginLeft: '50px', marginTop: '50px', height: '135px' }}>
        <div style={{ height: '100px', width: '400px' }}>
          <ChartGroup
            containerComponent={
              <ChartVoronoiContainer labels={({ datum }) => `${datum.name}: ${datum.y}`} constrainToVisibleArea />
            }
            height={100}
            maxDomain={{ y: 1 }}
            name={title}
            padding={0}
            themeColor={color}
            width={400}
          >
            <ChartArea data={data} />
          </ChartGroup>
        </div>
        <ChartContainer title={title}>
          <ChartLabel text={title} dy={15} />
        </ChartContainer>
      </div>
    )
  }

  const CpuUsage = ({ history }: { history: CpuLoadHistory }) => {
    const processData = history.map((item, index) => ({ name: 'process', x: index, y: item.process }))
    const systemData = history.map((item, index) => ({ name: 'system', x: index, y: item.system }))
    return (
      <Card isPlain>
        <CardTitle>CPU usage</CardTitle>
        <CardBody>
          <CpuSparkline title='Process CPU Load' color='blue' data={processData} />
          <CpuSparkline title='System CPU Load' color='green' data={systemData} />
        </CardBody>
      </Card>
    )
  }

  return (
    <React.Fragment>
      <SystemInfo info={systemInfo} />
      <CpuUsage history={cpuLoadHistory} />
    </React.Fragment>
  )
}

type ThreadsHistory = {
  total: number
  peak: number
  thread: number
  daemon: number
}[]

const threadsHistorySize = 50
const initialThreadsHistory: ThreadsHistory = Array(threadsHistorySize)
  .fill(0)
  .map(_ => ({
    total: 0,
    peak: 0,
    thread: 0,
    daemon: 0,
  }))

const ThreadsView: React.FunctionComponent = () => {
  const { selectedNode } = useContext(CustomTreeContext)
  const [isReading, setIsReading] = useState(true)
  const [threadsHistory, setThreadsHistory] = useState(initialThreadsHistory)

  useEffect(() => {
    if (!selectedNode || selectedNode.name !== 'Threading' || !selectedNode.mbean) {
      return
    }

    const { mbean } = selectedNode

    const updateHistory = (attrs: AttributeValues) => {
      const total = attrs['TotalStartedThreadCount'] as number
      const peak = attrs['PeakThreadCount'] as number
      const thread = attrs['ThreadCount'] as number
      const daemon = attrs['DaemonThreadCount'] as number
      // history is a FIFO queue
      setThreadsHistory(history => [...history.slice(1), { total, peak, thread, daemon }])
    }

    const readAttributes = async () => {
      const attrs = await jolokiaService.readAttributes(mbean)
      updateHistory(attrs)
      setIsReading(false)
    }
    readAttributes()

    let handle: number | null = null
    const register = async (request: IRequest, callback: IResponseFn) => {
      handle = await jolokiaService.register(request, callback)
      log.debug(selectedNode.name, '- Register request: handle =', handle)
    }
    register(
      {
        type: 'read',
        mbean,
        attribute: ['TotalStartedThreadCount', 'PeakThreadCount', 'ThreadCount', 'DaemonThreadCount'],
      },
      (response: IResponse) => {
        log.debug(selectedNode.name, '- Scheduler - Attributes:', response.value)
        const attrs = response.value as AttributeValues
        updateHistory(attrs)
      },
    )

    return () => {
      handle && jolokiaService.unregister(handle)
    }
  }, [selectedNode])

  if (!selectedNode || selectedNode.name !== 'Threading' || !selectedNode.mbean) {
    return null
  }

  if (isReading) {
    return <ReadingCard />
  }

  const Threads = ({ history }: { history: ThreadsHistory }) => {
    const threadTypes = ['Total started thread', 'Peak thread', 'Thread', 'Daemon thread']
    const legendData = threadTypes.map(type => ({ name: type }))
    const dataSet = [
      history.map(item => ({ name: threadTypes[0], y: item.total })),
      history.map(item => ({ name: threadTypes[1], y: item.peak })),
      history.map(item => ({ name: threadTypes[2], y: item.thread })),
      history.map(item => ({ name: threadTypes[3], y: item.daemon })),
    ]
    const max = history.reduce((max, item) => Math.max(item.total, max), 10)
    const yAxisTickValues = Array(max)
      .fill(0)
      .map((_, i) => i)
      .filter(n => n % 5 === 0)
    return (
      <Card isPlain>
        <CardTitle>Threads</CardTitle>
        <CardBody>
          <div style={{ height: '250px', width: '600px' }}>
            <Chart
              containerComponent={
                <ChartVoronoiContainer labels={({ datum }) => `${datum.name}: ${datum.y}`} constrainToVisibleArea />
              }
              legendData={legendData}
              legendOrientation='vertical'
              legendPosition='right'
              height={250}
              maxDomain={{ y: max }}
              minDomain={{ y: 0 }}
              name='threads'
              padding={{
                bottom: 50,
                left: 50,
                right: 250, // Adjusted to accommodate legend
                top: 50,
              }}
              width={600}
            >
              <ChartAxis dependentAxis showGrid tickValues={yAxisTickValues} />
              <ChartGroup>
                {dataSet.map((data, index) => (
                  <ChartLine key={`data-${index}`} data={data} />
                ))}
              </ChartGroup>
            </Chart>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <React.Fragment>
      <Threads history={threadsHistory} />
    </React.Fragment>
  )
}

const ReadingCard: React.FunctionComponent = () => (
  <Card isPlain>
    <CardBody>
      <Text component='p'>Reading attributes...</Text>
    </CardBody>
  </Card>
)
