import { useState, useMemo, useEffect } from "react"


export default function useOnScreen(ref) {

    const [isIntersecting, setIntersecting] = useState(false)
  
    const observer = useMemo(() => new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting)
    ), [])
  
  
    useEffect(() => {
      observer.observe(ref.current)
      return () => observer.disconnect()
    })
  
    return isIntersecting
  }