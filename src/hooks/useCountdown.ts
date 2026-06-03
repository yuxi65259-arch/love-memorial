import { useState, useEffect, useCallback } from 'react'

interface CountdownResult {
  years: number
  months: number
  days: number
  hours: number
  minutes: number
  seconds: number
  totalDays: number
  totalHours: number
  totalMinutes: number
  totalHeartbeats: number
}

function calcDiff(from: Date, to: Date): CountdownResult {
  const diffMs = to.getTime() - from.getTime()
  const totalSeconds = Math.floor(diffMs / 1000)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalDays = Math.floor(totalHours / 24)

  const years = Math.floor(totalDays / 365.25)
  const remainingDaysAfterYears = Math.floor(totalDays - years * 365.25)
  const months = Math.floor(remainingDaysAfterYears / 30.44)
  const days = Math.floor(remainingDaysAfterYears - months * 30.44)
  const hours = totalHours % 24
  const minutes = totalMinutes % 60
  const seconds = totalSeconds % 60
  const totalHeartbeats = Math.floor(totalMinutes * 72)

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    totalHours,
    totalMinutes,
    totalHeartbeats,
  }
}

export function useCountdown(sinceDate: Date) {
  const [elapsed, setElapsed] = useState<CountdownResult>(() =>
    calcDiff(sinceDate, new Date())
  )

  const tick = useCallback(() => {
    setElapsed(calcDiff(sinceDate, new Date()))
  }, [sinceDate])

  useEffect(() => {
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  return elapsed
}

export function useCountdownTo(targetDate: Date) {
  const [remaining, setRemaining] = useState<CountdownResult>(() =>
    calcDiff(new Date(), targetDate)
  )

  useEffect(() => {
    const tick = () => setRemaining(calcDiff(new Date(), targetDate))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return remaining
}
