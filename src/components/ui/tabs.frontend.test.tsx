import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

it('switches tab panels and supports line variant', async () => {
  const user = userEvent.setup()
  render(
    <Tabs defaultValue="one">
      <TabsList variant="line">
        <TabsTrigger value="one">One</TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one">First</TabsContent>
      <TabsContent value="two">Second</TabsContent>
    </Tabs>,
  )
  expect(screen.getByText('First')).toBeVisible()
  await user.click(screen.getByRole('tab', { name: 'Two' }))
  expect(screen.getByText('Second')).toBeVisible()
  expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tablist')).toHaveAttribute('data-variant', 'line')
})
