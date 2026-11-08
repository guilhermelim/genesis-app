import * as React from 'react'
import { render, screen } from '@testing-library/react'

jest.mock('@/components/ui/button', () => {
  const Button = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>((props, ref) => (
    <button ref={ref} {...props} />
  ))
  Button.displayName = 'Button'
  return { Button, buttonVariants: () => '' }
})

jest.mock('react-day-picker', () => {
  type CalendarComponent = React.ComponentType<Record<string, unknown>>
  function DayPicker({
    components,
    formatters,
  }: {
    components: Record<string, CalendarComponent>
    formatters: { formatMonthDropdown: (date: Date) => string }
  }) {
    const Root = components.Root
    const Chevron = components.Chevron
    const DayButton = components.DayButton
    const WeekNumber = components.WeekNumber
    const day = { date: new Date(2025, 0, 1), displayMonth: new Date(2025, 0, 1) }
    formatters.formatMonthDropdown(day.date)
    return (
      <Root>
        <div>
          <Chevron orientation="left" />
          <Chevron orientation="right" />
          <Chevron orientation="down" />
        </div>
        <table>
          <tbody>
            <tr>
              <td>
                <DayButton
                  day={day}
                  modifiers={{
                    selected: true,
                    range_start: false,
                    range_end: false,
                    range_middle: false,
                    focused: true,
                  }}
                >
                  1
                </DayButton>
              </td>
              <WeekNumber>1</WeekNumber>
            </tr>
          </tbody>
        </table>
      </Root>
    )
  }
  return {
    DayPicker,
    getDefaultClassNames: () => new Proxy({}, { get: () => '' }),
  }
})

import { Calendar } from './calendar'

it('covers calendar adapter components in isolation', () => {
  jest.spyOn(React, 'useRef').mockReturnValue({ current: { focus: jest.fn() } } as never)
  render(<Calendar locale={{ code: 'en-US' }} />)
  expect(document.querySelector('[data-slot="calendar"]')).toBeInTheDocument()
  expect(screen.getAllByText('1').length).toBeGreaterThan(0)
  expect(screen.getAllByText('1').at(-1)?.closest('td')).toBeInTheDocument()
})
