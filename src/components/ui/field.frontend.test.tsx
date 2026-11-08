import { render, screen } from '@testing-library/react'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from './field'

describe('Field components', () => {
  it('connects labels and exposes orientation and descriptions', () => {
    render(
      <Field orientation="horizontal">
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <input id="email" />
        <FieldDescription>Required</FieldDescription>
      </Field>,
    )
    expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'horizontal')
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Required')).toHaveAttribute('data-slot', 'field-description')
  })

  it('deduplicates errors and supports legend and separator content', () => {
    render(
      <FieldSet>
        <FieldLegend variant="label">Account</FieldLegend>
        <FieldError errors={[{ message: 'Invalid' }, { message: 'Invalid' }, { message: 'Missing' }]} />
        <FieldSeparator>or</FieldSeparator>
      </FieldSet>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid')
    expect(screen.getByRole('alert')).toHaveTextContent('Missing')
    expect(screen.getByText('or')).toHaveAttribute('data-slot', 'field-separator-content')
    expect(screen.getByText('Account')).toHaveAttribute('data-variant', 'label')
  })

  it('renders all layout variants and error fallbacks', () => {
    render(
      <FieldSet>
        <FieldGroup>
          <Field orientation="responsive" data-disabled>
            <FieldTitle>Title</FieldTitle>
            <FieldContent>
              <FieldLabel>Label</FieldLabel>
            </FieldContent>
          </Field>
          <Field orientation={null}>
            <FieldDescription>desc</FieldDescription>
          </Field>
          <FieldSeparator />
          <FieldError errors={[undefined, { message: 'Only' }, { message: 'Only' }]} />
          <FieldError>Custom error</FieldError>
          <FieldError />
          <FieldError errors={[]} />
          <FieldError errors={[undefined]} />
          <FieldError errors={[{ message: 'Single' }]} />
        </FieldGroup>
      </FieldSet>,
    )
    expect(screen.getByText('Title')).toHaveAttribute('data-slot', 'field-label')
    expect(screen.getByText('Only')).toBeInTheDocument()
    expect(screen.getByText('Custom error')).toBeInTheDocument()
    expect(screen.queryAllByRole('alert')).toHaveLength(3)
  })
})
