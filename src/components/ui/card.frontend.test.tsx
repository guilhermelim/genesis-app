import { render, screen } from '@testing-library/react'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

it('renders all card regions and preserves the compact size', () => {
  render(
    <Card size="sm">
      <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Details</CardDescription>
        <CardAction>Action</CardAction>
      </CardHeader>
      <CardContent>Content</CardContent>
      <CardFooter>Footer</CardFooter>
    </Card>,
  )
  expect(screen.getByText('Title')).toHaveAttribute('data-slot', 'card-title')
  expect(screen.getByText('Details')).toHaveAttribute('data-slot', 'card-description')
  expect(screen.getByText('Action')).toHaveAttribute('data-slot', 'card-action')
  expect(screen.getByText('Content')).toHaveAttribute('data-slot', 'card-content')
  expect(screen.getByText('Footer')).toHaveAttribute('data-slot', 'card-footer')
})
