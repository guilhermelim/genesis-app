import { pollDefaultValues } from './poll.default-values'
import { pollSchema } from './poll.schema'

describe('poll form contract', () => {
  it('builds empty defaults and preserves edit values', () => {
    const expiresAt = new Date('2026-01-01T10:00:00Z')
    expect(pollDefaultValues(undefined, expiresAt)).toEqual({
      name: '',
      title: '',
      description: '',
      expiresAt,
      photos: [],
    })
  })

  it('accepts a valid poll and enforces the photo limit', () => {
    const valid = {
      name: 'Enquete',
      title: 'Título',
      description: 'Descrição',
      photos: [{ id: 'photo-1', dataUrl: 'data:image/jpeg;base64,test', isPrimary: true }],
    }
    expect(pollSchema.safeParse(valid).success).toBe(true)
    expect(
      pollSchema.safeParse({
        ...valid,
        photos: Array.from({ length: 11 }, (_, i) => ({ id: String(i), dataUrl: 'data:', isPrimary: i === 0 })),
      }).success,
    ).toBe(false)
  })
})
