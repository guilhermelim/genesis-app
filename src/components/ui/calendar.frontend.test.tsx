import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { Calendar, CalendarDayButton } from './calendar'

const day = (date: Date): ComponentProps<typeof CalendarDayButton>['day'] =>
  ({ date, displayMonth: date }) as unknown as ComponentProps<typeof CalendarDayButton>['day']

it('renders an accessible calendar and supports outside-day configuration', () => {
  render(<Calendar month={new Date(2025, 0, 1)} showOutsideDays={false} />)
  expect(screen.getByRole('grid')).toBeInTheDocument()
  expect(document.querySelector('[data-slot="calendar"]')).toBeInTheDocument()
  expect(screen.getAllByRole('button')).toHaveLength(2)
})

it('supports dropdown captions, week numbers, custom classes and day modifiers', () => {
  const date = new Date(2025, 0, 15)
  render(
    <>
      <Calendar
        month={date}
        captionLayout="dropdown"
        showWeekNumber
        className="calendar-custom"
        classNames={{ day: 'day-custom' }}
        formatters={{ formatMonthDropdown: () => 'January' }}
      />
      <CalendarDayButton
        day={day(date)}
        modifiers={{ selected: true, range_start: true, range_end: false, range_middle: false, focused: true }}
      >
        15
      </CalendarDayButton>
    </>,
  )
  expect(document.querySelector('.calendar-custom')).toBeInTheDocument()
  const dayButton = screen.getAllByText('15').at(-1)!
  expect(dayButton).toHaveAttribute('data-selected-single', 'false')
  expect(dayButton).toHaveAttribute('data-range-start', 'true')
  const unselected = document.createElement('div')
  render(
    <CalendarDayButton
      day={day(new Date(2025, 0, 16))}
      modifiers={{ selected: false, range_start: false, range_end: false, range_middle: false, focused: false }}
    >
      16
    </CalendarDayButton>,
    { container: unselected },
  )
  render(
    <>
      <CalendarDayButton
        day={day(new Date(2025, 0, 17))}
        modifiers={{ selected: true, range_start: false, range_end: true, range_middle: false, focused: false }}
      >
        17
      </CalendarDayButton>
      <CalendarDayButton
        day={day(new Date(2025, 0, 18))}
        modifiers={{ selected: true, range_start: false, range_end: false, range_middle: true, focused: false }}
      >
        18
      </CalendarDayButton>
      <CalendarDayButton
        day={day(new Date(2025, 0, 19))}
        modifiers={{ selected: true, range_start: false, range_end: false, range_middle: false, focused: false }}
      >
        19
      </CalendarDayButton>
      <CalendarDayButton day={day(new Date(2025, 0, 20))} modifiers={{} as never}>
        20
      </CalendarDayButton>
    </>,
  )
})
