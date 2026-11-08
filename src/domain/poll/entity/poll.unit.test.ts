import PollFactory from '../factory/poll.factory'

describe('Poll', () => {
  it('updates details and clears votes', () => {
    let poll = PollFactory.createDefault()
    const vote = PollFactory.createVote('member-1', 'activity-1')

    poll = poll.addVote(vote)
    poll = poll.updateDetails('Novo nome', 'Novo título', 'Nova descrição')
    poll = poll.clearVotes()

    expect(poll.name).toBe('Novo nome')
    expect(poll.title).toBe('Novo título')
    expect(poll.description).toBe('Nova descrição')
    expect(poll.votes).toEqual([])
  })

  it.each([
    ['', 'Título', 'Descrição', 'poll-1', 'Name is required.'],
    ['Nome', '', 'Descrição', 'poll-1', 'Title is required.'],
    ['Nome', 'Título', 'Descrição', '', 'Invalid ID.'],
  ])('rejects invalid state', (name, title, description, id, message) => {
    expect(() => PollFactory.create(name, title, description, [], id)).toThrow(message)
  })

  it('prevents a member from voting twice', () => {
    let poll = PollFactory.createDefault()
    const firstVote = PollFactory.createVote('member-1', 'activity-1')

    poll = poll.addVote(firstVote)

    expect(() => poll.addVote(PollFactory.createVote('member-1', 'activity-2'))).toThrow('Member has already voted.')
  })

  it('prevents an activity from being selected twice', () => {
    let poll = PollFactory.createDefault()

    poll = poll.addVote(PollFactory.createVote('member-1', 'activity-1'))

    expect(() => poll.addVote(PollFactory.createVote('member-2', 'activity-1'))).toThrow(
      'Activity has already been selected.',
    )
  })

  it('does not expose the internal votes collection', () => {
    let poll = PollFactory.createDefault()
    poll = poll.addVote(PollFactory.createVote('member-1', 'activity-1'))

    expect(poll.votes).not.toBe(poll.votes)
    expect(poll.votes).toHaveLength(1)
  })

  it('is frozen and protects its internal collections and dates', () => {
    const poll = PollFactory.createDefault()
    const votes = [...poll.votes]
    const expiresAt = poll.expiresAt

    expect(Object.isFrozen(poll)).toBe(true)
    votes.push(PollFactory.createVote('member-1', 'activity-1'))
    expiresAt.setFullYear(2000)

    expect(poll.votes).toEqual([])
    expect(poll.expiresAt.getFullYear()).not.toBe(2000)
  })

  it('manages activity, expiration, and photos', () => {
    const expiresAt = new Date(Date.now() + 60_000)
    const poll = PollFactory.create(
      'Nome',
      'Título',
      'Descrição',
      [],
      'poll-1',
      undefined,
      undefined,
      undefined,
      [],
      expiresAt,
    )
    const photo = { id: 'photo-1', dataUrl: 'data:image/png;base64,abc', isPrimary: true }

    let updatedPoll = poll.replacePhotos([photo])
    expect(updatedPoll.photos).toEqual([photo])
    expect(updatedPoll.isAvailable()).toBe(true)
    updatedPoll = updatedPoll.deactivate()
    expect(updatedPoll.isAvailable()).toBe(false)
    updatedPoll = updatedPoll.activate()
    expect(updatedPoll.isAvailable(new Date(expiresAt.getTime() + 1))).toBe(false)
  })

  it('does not activate after its expiration date', () => {
    const expiresAt = new Date('2026-01-01T00:00:00.000Z')
    const poll = PollFactory.create(
      'Nome',
      'Título',
      'Descrição',
      [],
      'poll-expired',
      undefined,
      undefined,
      undefined,
      [],
      expiresAt,
      false,
    )

    expect(() => poll.activate(new Date('2026-01-01T00:00:01.000Z'))).toThrow(
      'Cannot activate a poll with an expired expiration date.',
    )
    expect(poll.active).toBe(false)
  })

  it('deactivates itself when its expiration date is reached', () => {
    const poll = PollFactory.create(
      'Nome',
      'Título',
      'Descrição',
      [],
      'poll-expiring',
      undefined,
      undefined,
      undefined,
      [],
      new Date('2026-01-01T00:00:00.000Z'),
      true,
    )

    const expiredPoll = poll.expireIfNeeded(new Date('2026-01-01T00:00:01.000Z'))
    expect(expiredPoll).not.toBe(poll)
    expect(expiredPoll.active).toBe(false)
    expect(poll.active).toBe(true)
    expect(expiredPoll.expireIfNeeded()).toBe(expiredPoll)
  })

  it('deactivates when updated with an expired expiration date', () => {
    const poll = PollFactory.createDefault()

    const updatedPoll = poll.updateDetails('Nome', 'Título', 'Descrição', new Date('2026-01-01T00:00:00.000Z'))

    expect(updatedPoll.active).toBe(false)
  })

  it('rejects invalid photo collections', () => {
    const poll = PollFactory.createDefault()
    expect(() =>
      poll.replacePhotos(
        Array.from({ length: 11 }, (_, index) => ({
          id: `photo-${index}`,
          dataUrl: 'data:image/png;base64,abc',
          isPrimary: index === 0,
        })),
      ),
    ).toThrow('An enquête can have at most 10 photos.')
    expect(() => poll.replacePhotos([{ id: 'photo-1', dataUrl: 'not-an-image', isPrimary: true }])).toThrow(
      'Poll photos must be valid image data.',
    )
    expect(
      poll.replacePhotos([{ id: 'photo-1', dataUrl: 'data:image/png;base64,abc', isPrimary: false }]).photos[0],
    ).toMatchObject({
      id: 'photo-1',
      isPrimary: true,
    })
  })
})
