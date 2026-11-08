import { render, screen } from '@testing-library/react'
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from './avatar'

it('renders image, fallback, badge and group metadata', () => {
  render(
    <Avatar size="lg">
      <AvatarImage src="/avatar.png" alt="Jane" />
      <AvatarFallback>J</AvatarFallback>
      <AvatarBadge data-testid="badge" />
    </Avatar>,
  )
  expect(screen.getByText('J')).toBeInTheDocument()
  expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'avatar-badge')
  const { container } = render(
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+2</AvatarGroupCount>
    </AvatarGroup>,
  )
  expect(container.querySelector('[data-slot="avatar-group-count"]')).toHaveTextContent('+2')
})
