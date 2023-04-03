import { PageSection, PageSectionVariants, Text, TextContent } from '@patternfly/react-core'
import React from 'react'

export const SimplePlugin: React.FunctionComponent = () => (
  <PageSection variant='light'>
    <TextContent>
      <Text component='h1'>Simple Plugin</Text>
      <Text component='p'>Hello world!</Text>
    </TextContent>
  </PageSection>
)
