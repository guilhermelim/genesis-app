import { render, screen } from '@testing-library/react'
import PageContainer from './page-container'

it('provides the constrained page container and merges classes', () => {
  render(<PageContainer className="custom">Content</PageContainer>)
  expect(screen.getByText('Content')).toHaveClass('max-w-4xl', 'custom')
})
