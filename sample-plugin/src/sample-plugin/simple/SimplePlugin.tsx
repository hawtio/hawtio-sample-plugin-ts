import { PageSection, Content,  } from '@patternfly/react-core'
import React from 'react'

export const SimplePlugin: React.FunctionComponent = () => (
  <PageSection hasBodyWrapper={false} >
    <Content>
      <Content component='h1'>Simple Plugin</Content>
      <Content component='p'>Hello world!</Content>
    </Content>
  </PageSection>
)
