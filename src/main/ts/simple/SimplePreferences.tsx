import { Button, CardBody, Form, FormGroup, FormSection } from '@patternfly/react-core'
import React from 'react'

export const SimplePreferences: React.FunctionComponent = () => (
  <CardBody>
    <Form isHorizontal>
      <FormSection title='UI' titleElement='h2'>
        <FormGroup
          label='Reset settings'
          fieldId='reset-form-reset'
          helperText="Clear all custom settings stored in your browser's local storage and reset to defaults."
        >
          <Button variant='primary'>
            Button
          </Button>
        </FormGroup>
      </FormSection>
    </Form>
  </CardBody>
)
