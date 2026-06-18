import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { format, addDays, startOfWeek, isWeekend, isSameDay, parse } from 'date-fns'

// Mock function - In production, this would call Google Calendar API
const fetchBusySlots = async (date) => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock some busy slots for demo
      const busySlots = [
        '09:00 AM',
        '10:00 AM',
        '02:00 PM'
      ]
      resolve(busySlots)
    }, 500)
  })
}

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
]

export default function AppointmentCalendar({ onSelectSlot, selectedSlot }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [selectedDate, setSelectedDate] = useState(null)
  const [busySlots, setBusySlots] = useState([])
  const [loading, setLoading] = useState(false)

  // Generate weekdays (Mon-Fri) for current week
  const weekdays = Array.from({ length: 5 }, (_, i) => addDays(currentWeekStart, i))

  useEffect(() => {
    if (selectedDate) {
      loadBusySlots(selectedDate)
    }
  }, [selectedDate])

  const loadBusySlots = async (date) => {
    setLoading(true)
    try {
      const busy = await fetchBusySlots(date)
      setBusySlots(busy)
    } catch (error) {
      console.error('Error loading busy slots:', error)
      setBusySlots([])
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7))
    setSelectedDate(null)
  }

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7))
    setSelectedDate(null)
  }

  const handleDateSelect = (date) => {
    if (isWeekend(date) || date < new Date()) return
    setSelectedDate(date)
  }

  const handleTimeSelect = (time) => {
    if (!selectedDate) return
    if (busySlots.includes(time)) return

    onSelectSlot({
      date: format(selectedDate, 'MMMM dd, yyyy'),
      time: time,
      dateObj: selectedDate
    })
  }

  const isSlotBusy = (time) => busySlots.includes(time)
  const isSlotSelected = (time) => selectedSlot && selectedSlot.time === time && selectedSlot.date === format(selectedDate, 'MMMM dd, yyyy')

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePreviousWeek}
          className="p-2 hover:bg-emerald-50 rounded-full transition-all duration-200"
          aria-label="Previous week"
        >
          <ChevronLeft size={20} className="text-emerald-700" />
        </button>
        <h4 className="font-bold text-sm text-gray-900">
          {format(currentWeekStart, 'MMM dd')} - {format(addDays(currentWeekStart, 4), 'MMM dd, yyyy')}
        </h4>
        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-emerald-50 rounded-full transition-all duration-200"
          aria-label="Next week"
        >
          <ChevronRight size={20} className="text-emerald-700" />
        </button>
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-5 gap-2">
        {weekdays.map((date) => {
          const isPast = date < new Date() && !isSameDay(date, new Date())
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isDisabled = isPast || isWeekend(date)

          return (
            <button
              key={date.toString()}
              onClick={() => handleDateSelect(date)}
              disabled={isDisabled}
              className={`p-2 rounded-xl text-center text-xs transition-all duration-200 ${isSelected
                  ? 'bg-emerald-600 text-white font-bold shadow-md'
                  : isDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200'
                }`}
            >
              <div className="font-bold">{format(date, 'EEE')}</div>
              <div className="text-lg mt-1">{format(date, 'd')}</div>
            </button>
          )
        })}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium ml-1">
            <Clock size={16} className="text-emerald-600" />
            <span>Select a time slot</span>
          </div>

          {loading ? (
            <div className="text-center py-4 text-sm text-emerald-600 font-medium">Loading available slots...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {TIME_SLOTS.map((time) => {
                const busy = isSlotBusy(time)
                const selected = isSlotSelected(time)

                return (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    disabled={busy}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${selected
                        ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-100'
                        : busy
                          ? 'bg-gray-50 text-gray-300 cursor-not-allowed line-through border-transparent'
                          : 'bg-white border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50'
                      }`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Slot Display */}
      {selectedSlot && (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-sm shadow-sm animate-in fade-in slide-in-from-top-1">
          <p className="font-bold text-emerald-900">Requested Time:</p>
          <p className="text-emerald-700 mt-1 font-medium">
            📅 {selectedSlot.date} at {selectedSlot.time}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-gray-400 pt-3 border-t border-gray-50 uppercase tracking-widest font-bold">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-600 rounded-sm"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-gray-100 rounded-sm"></div>
          <span>Taken</span>
        </div>
      </div>
    </div>
  )
}

