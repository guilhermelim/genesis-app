import { z } from 'zod'
import DomainError from '@/domain/@shared/errors/domain-error'
import ConcurrencyError from '@/domain/@shared/errors/concurrency-error'

export interface ActionError {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DOMAIN_ERROR' | 'CONFLICT' | 'INFRASTRUCTURE_ERROR'
  message: string
}

export type ActionResult<T> = { success: true; data: T } | { success: false; error: ActionError }

function getErrorDetails(cause: unknown): ActionError {
  if (cause instanceof z.ZodError) {
    return {
      code: 'VALIDATION_ERROR',
      message: cause.issues[0]?.message ?? 'Os dados informados são inválidos.',
    }
  }

  if (cause instanceof DomainError) {
    return { code: 'DOMAIN_ERROR', message: cause.message }
  }

  if (cause instanceof ConcurrencyError) {
    return { code: 'CONFLICT', message: 'Os dados foram alterados por outra operação. Atualize e tente novamente.' }
  }

  const message = cause instanceof Error ? cause.message : ''
  if (/not found/i.test(message)) {
    return { code: 'NOT_FOUND', message: 'O registro solicitado não foi encontrado.' }
  }

  if (cause instanceof Error && /required|invalid/i.test(message)) {
    return { code: 'DOMAIN_ERROR', message }
  }

  return {
    code: 'INFRASTRUCTURE_ERROR',
    message: 'Não foi possível concluir a operação. Tente novamente.',
  }
}

export async function runAction<T>(operation: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await operation() }
  } catch (cause) {
    return { success: false, error: getErrorDetails(cause) }
  }
}

export async function unwrapActionResult<T>(result: Promise<ActionResult<T>>): Promise<T> {
  const output = await result
  if (!output.success) {
    throw new Error(output.error.message)
  }
  return output.data
}
