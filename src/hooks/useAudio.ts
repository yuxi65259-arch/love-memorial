import { useState, useEffect, useRef, useCallback } from 'react'

export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const audio = new Audio(src)
    audio.loop = true
    audio.preload = 'auto'
    audioRef.current = audio

    const onCanPlay = () => setIsLoaded(true)
    audio.addEventListener('canplaythrough', onCanPlay)

    return () => {
      audio.removeEventListener('canplaythrough', onCanPlay)
      audio.pause()
      audioRef.current = null
    }
  }, [src])

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay blocked — user interaction required
      })
    }
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  return { isPlaying, isLoaded, play, pause, toggle, audioRef }
}
