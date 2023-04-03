import { CardBody, Text, TextContent } from '@patternfly/react-core'
import React from 'react'

export const SimplePreferences: React.FunctionComponent = () => (
  <CardBody>
    <TextContent>
      <Text component='h2'>Simple Plugin</Text>
      <Text component='p'>Preferences view for Simple plugin.</Text>
    </TextContent>
  </CardBody>
)
