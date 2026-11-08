import { z } from 'zod'
import { runAction, unwrapActionResult } from './action-result'
import DomainError from '@/domain/@shared/errors/domain-error'
import ConcurrencyError from '@/domain/@shared/errors/concurrency-error'

describe('ActionResult', () => {
  it('returns successful operation data', async () => {
    await expect(runAction(async () => ({ id: 'activity-1' }))).resolves.toEqual({
      success: true,
      data: { id: 'activity-1' },
    })
  })

  it('maps validation failures without exposing internal details', async () => {
    const result = await runAction(async () => {
      z.string().min(1, 'Nome obrigatório').parse('')
      return true
    })

    expect(result).toEqual({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Nome obrigatório' },
    })
  })

  it('maps missing entities to a safe not-found error', async () => {
    const result = await runAction(async () => {
      throw new Error('Activity not found')
    })

    expect(result).toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'O registro solicitado não foi encontrado.' },
    })
  })

  it('maps domain and unexpected failures to safe errors', async () => {
    await expect(
      runAction(async () => {
        throw new Error('Name is required.')
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: 'DOMAIN_ERROR', message: 'Name is required.' },
    })

    await expect(
      runAction(async () => {
        throw new Error('database connection failed')
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: 'INFRASTRUCTURE_ERROR', message: 'Não foi possível concluir a operação. Tente novamente.' },
    })

    await expect(
      runAction(async () => {
        throw 'unexpected'
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: 'INFRASTRUCTURE_ERROR', message: 'Não foi possível concluir a operação. Tente novamente.' },
    })

    await expect(
      runAction(async () => {
        throw new z.ZodError([])
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Os dados informados são inválidos.' },
    })
  })

  it('unwraps successful results and throws action errors', async () => {
    await expect(unwrapActionResult(Promise.resolve({ success: true, data: 'ok' }))).resolves.toBe('ok')
    await expect(
      unwrapActionResult(
        Promise.resolve({
          success: false as const,
          error: { code: 'DOMAIN_ERROR' as const, message: 'Nome inválido' },
        }),
      ),
    ).rejects.toThrow('Nome inválido')
  })

  it('maps typed domain and concurrency failures explicitly', async () => {
    await expect(
      runAction(async () => {
        throw new DomainError('Inactive members cannot vote.')
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: 'DOMAIN_ERROR', message: 'Inactive members cannot vote.' },
    })

    await expect(
      runAction(async () => {
        throw new ConcurrencyError()
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: 'CONFLICT', message: 'Os dados foram alterados por outra operação. Atualize e tente novamente.' },
    })
  })
})
