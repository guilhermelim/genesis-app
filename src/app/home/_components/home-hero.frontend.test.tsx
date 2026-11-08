import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import HomeHero from './home-hero'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'> & { priority?: boolean; fill?: boolean; unoptimized?: boolean }) => {
    const { priority, fill, unoptimized, ...imageProps } = props
    void priority
    void fill
    void unoptimized
    return createElement('img', { ...imageProps, alt: imageProps.alt ?? '' })
  },
}))

describe('HomeHero', () => {
  it('presents the community volunteering message and member count', () => {
    render(<HomeHero memberCount={12} />)

    expect(screen.getByAltText('Genesis Banner')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Life Group Gênesis' })).toBeInTheDocument()
    expect(screen.getByText('12 membros participando')).toBeInTheDocument()
    expect(screen.getByText('Sirva em poucos passos')).toBeInTheDocument()
  })

  it('uses the primary poll photo instead of the default banner', () => {
    render(
      <HomeHero
        memberCount={12}
        pollTitle="Mutirão comunitário"
        photos={[
          { id: 'photo-1', dataUrl: 'data:image/png;base64,secondary', isPrimary: false },
          { id: 'photo-2', dataUrl: 'data:image/png;base64,primary', isPrimary: true },
        ]}
      />,
    )

    expect(screen.queryByAltText('Genesis Banner')).not.toBeInTheDocument()
    const featuredImage = screen.getByAltText('Imagem de destaque: Mutirão comunitário')
    expect(featuredImage).toHaveAttribute('src', 'data:image/png;base64,primary')
    expect(featuredImage).toHaveClass('h-auto', 'w-full', 'object-contain')
  })

  it('uses the first poll photo when none is marked as primary', () => {
    render(
      <HomeHero
        memberCount={12}
        pollTitle="Mutirão comunitário"
        photos={[
          { id: 'photo-1', dataUrl: 'data:image/png;base64,first', isPrimary: false },
          { id: 'photo-2', dataUrl: 'data:image/png;base64,second', isPrimary: false },
        ]}
      />,
    )

    expect(screen.getByAltText('Imagem de destaque: Mutirão comunitário')).toHaveAttribute(
      'src',
      'data:image/png;base64,first',
    )
  })
})
