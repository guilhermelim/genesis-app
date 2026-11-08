'use client'

import { Fragment, useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from 'cn'

export type PaginationControlsProps = {
  page: number
  pageSize: number
  totalItems: number
  onPageChange?: (page: number, pageSize: number) => void | Promise<void>
  onPageSizeChange?: (pageSize: number) => void | Promise<void>
  onError?: (error: unknown) => void
  itemLabel?: string
  showSummary?: boolean
  pageSizeOptions?: number[]
  pageParam?: string
  pageSizeParam?: string
  pageSizeLabel?: string
  previousLabel?: string
  nextLabel?: string
  className?: string
}

export function PaginationControls({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onError = error => console.error('Pagination request failed', error),
  itemLabel = 'itens',
  showSummary = true,
  pageSizeOptions = [5, 10, 20, 50],
  pageParam = 'page',
  pageSizeParam = 'pageSize',
  pageSizeLabel = 'Linhas por página',
  previousLabel = 'Anterior',
  nextLabel = 'Próxima',
  className,
}: PaginationControlsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const configuredPageSizes = Array.from(new Set(pageSizeOptions.filter(size => Number.isInteger(size) && size > 0)))
  const availablePageSizes = configuredPageSizes.length > 0 ? configuredPageSizes : [5, 10, 20, 50]
  const effectivePageSize = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : availablePageSizes[0]
  const selectablePageSizes = availablePageSizes.includes(effectivePageSize)
    ? availablePageSizes
    : [effectivePageSize, ...availablePageSizes]
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize))
  const firstItem = totalItems ? (page - 1) * effectivePageSize + 1 : 0
  const lastItem = Math.min(page * effectivePageSize, totalItems)

  const getUrl = useCallback(
    (nextPage: number, nextPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(pageParam, String(nextPage))
      params.set(pageSizeParam, String(nextPageSize))
      return `${pathname}?${params.toString()}`
    },
    [pageParam, pageSizeParam, pathname, searchParams],
  )

  useEffect(() => {
    if (searchParams.get(pageParam) !== String(page) || searchParams.get(pageSizeParam) !== String(effectivePageSize)) {
      router.replace(getUrl(page, effectivePageSize), { scroll: false })
    }
  }, [effectivePageSize, getUrl, page, pageParam, pageSizeParam, router, searchParams])

  const changePage = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
    await onPageChange?.(nextPage, effectivePageSize)
    router.replace(getUrl(nextPage, effectivePageSize), { scroll: false })
  }

  const changePageSize = async (nextPageSize: number) => {
    if (!selectablePageSizes.includes(nextPageSize) || nextPageSize === effectivePageSize) return
    await onPageSizeChange?.(nextPageSize)
    router.replace(getUrl(1, nextPageSize), { scroll: false })
  }

  const requestPageChange = (nextPage: number) => {
    void changePage(nextPage).catch(onError)
  }

  const requestPageSizeChange = (nextPageSize: number) => {
    void changePageSize(nextPageSize).catch(onError)
  }

  return (
    <div className={cn('flex flex-col items-center gap-3 border-t pt-4', className)}>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor={`${pageSizeParam}-select`}>{pageSizeLabel}</FieldLabel>
          <Select value={String(effectivePageSize)} onValueChange={value => requestPageSizeChange(Number(value))}>
            <SelectTrigger className="w-20" id={`${pageSizeParam}-select`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                {selectablePageSizes.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        {totalPages > 1 && (
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={getUrl(Math.max(1, page - 1), effectivePageSize)}
                  text={previousLabel}
                  aria-disabled={page === 1}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                  onClick={event => {
                    event.preventDefault()
                    requestPageChange(page - 1)
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter(number => number === 1 || number === totalPages || Math.abs(number - page) <= 1)
                .map((number, index, visible) => (
                  <Fragment key={number}>
                    {index > 0 && visible[index - 1] !== number - 1 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href={getUrl(number, effectivePageSize)}
                        isActive={number === page}
                        onClick={event => {
                          event.preventDefault()
                          requestPageChange(number)
                        }}
                      >
                        {number}
                      </PaginationLink>
                    </PaginationItem>
                  </Fragment>
                ))}
              <PaginationItem>
                <PaginationNext
                  href={getUrl(Math.min(totalPages, page + 1), effectivePageSize)}
                  text={nextLabel}
                  aria-disabled={page === totalPages}
                  className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                  onClick={event => {
                    event.preventDefault()
                    requestPageChange(page + 1)
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
      {showSummary && (
        <p className="text-center text-sm text-muted-foreground">
          Exibindo {firstItem}-{lastItem} de {totalItems} {itemLabel}.
        </p>
      )}
    </div>
  )
}
