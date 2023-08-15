'use client'
import { useEffect, useState } from 'react'

const useTimeAgo = (targetDate: Date): string => {
  const [timeAgo, setTimeAgo] = useState<string>('')

  useEffect(() => {
    const updateInterval = 1000 // 1초마다 갱신
    const updateTimeAgo = () => {
      const currentTime = new Date()
      const timeDifference = currentTime.getTime() - targetDate.getTime()

      // 밀리초를 초 단위로 변환
      const seconds = Math.floor(timeDifference / 1000)

      // 1분 이내인 경우
      if (seconds < 60) {
        setTimeAgo(`${seconds}초 전`)
        return
      }

      // 분 단위 계산
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) {
        setTimeAgo(`${minutes}분 전`)
        return
      }

      // 시간 단위 계산
      const hours = Math.floor(minutes / 60)
      if (hours < 24) {
        setTimeAgo(`${hours}시간 전`)
        return
      }

      // 날짜 단위 계산
      const days = Math.floor(hours / 24)
      setTimeAgo(`${days}일 전`)
    }

    updateTimeAgo()

    const intervalId = setInterval(updateTimeAgo, updateInterval)

    return () => clearInterval(intervalId)
  }, [targetDate])

  return timeAgo
}

export default useTimeAgo
