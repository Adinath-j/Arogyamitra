import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Play, Pause, Eye, Trophy, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { youtubeApi } from '../../services/api'

export default function ExercisePlayer({ exercise, onClose }) {
  const canvasRef    = useRef(null)
  const videoRef     = useRef(null)
  const streamRef    = useRef(null)
  const animRef      = useRef(0)
  const prevFrameRef = useRef(null)
  const motionHist   = useRef([])

  const [cameraActive, setCameraActive]     = useState(false)
  const [isPlaying, setIsPlaying]           = useState(false)
  const [timeLeft, setTimeLeft]             = useState(parseInt(exercise.rest) || 60)
  const [setsLeft, setSetsLeft]             = useState(exercise.sets)
  const [status, setStatus]                 = useState('idle')
  const [isMoving, setIsMoving]             = useState(false)
  const [movementScore, setMovementScore]   = useState(0)
  const [caloriesBurned, setCaloriesBurned] = useState(0)
  const [ytResults, setYtResults]           = useState([])
  const [loadingVideo, setLoadingVideo]     = useState(false)

  useEffect(() => {
    if (exercise.youtube_search) {
      setLoadingVideo(true)
      youtubeApi.search(exercise.youtube_search, 3)
        .then(d => setYtResults(d.results || []))
        .catch(() => {})
        .finally(() => setLoadingVideo(false))
    }
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { setIsPlaying(false); toast.success('Rest done! Next set 💪'); return 0 }
      return p - 1
    }), 1000)
    return () => clearInterval(t)
  }, [isPlaying, timeLeft])

  const detectMotion = useCallback(() => {
    if (!canvasRef.current || !videoRef.current || !cameraActive) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0, 160, 120)
    const frame = ctx.getImageData(0, 0, 160, 120)
    if (prevFrameRef.current) {
      let diff = 0
      for (let i = 0; i < frame.data.length; i += 4) diff += Math.abs(frame.data[i] - prevFrameRef.current.data[i])
      const intensity = diff / (frame.data.length / 4)
      motionHist.current.push(intensity)
      if (motionHist.current.length > 20) motionHist.current.shift()
      const avg = motionHist.current.reduce((a, b) => a + b, 0) / motionHist.current.length
      setMovementScore(Math.min(100, Math.round(avg * 2)))
      setIsMoving(intensity > 8)
      if (intensity > 15) setCaloriesBurned(p => p + 0.05)
    }
    prevFrameRef.current = frame
    animRef.current = requestAnimationFrame(detectMotion)
  }, [cameraActive])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      setCameraActive(true)
      toast.success('Camera active — motion detection enabled 👁️')
    } catch { toast.error('Camera access denied') }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    cancelAnimationFrame(animRef.current)
    setCameraActive(false)
  }

  useEffect(() => {
    if (cameraActive) animRef.current = requestAnimationFrame(detectMotion)
    return () => cancelAnimationFrame(animRef.current)
  }, [cameraActive, detectMotion])

  const handleSetComplete = () => {
    const next = setsLeft - 1
    setSetsLeft(next)
    if (next <= 0) {
      setStatus('completed')
      stopCamera()
      toast.success(`🎉 Done! ~${caloriesBurned.toFixed(0)} kcal burned`)
    } else {
      toast.success(`Set ${exercise.sets - next} done! Rest now.`)
      setTimeLeft(parseInt(exercise.rest) || 60)
      setIsPlaying(true)
    }
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="glass rounded-3xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-5 border-b border-white/6">
          <div>
            <h2 className="font-semibold text-white">{exercise.name}</h2>
            <p className="text-xs text-white/35 mt-0.5">{exercise.muscle_group} · {exercise.sets} sets × {exercise.reps} reps</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/8 transition-all text-white/40"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-5">
          {status === 'completed' ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-forest-500/10 border border-forest-500/20">
              <Trophy size={18} className="text-forest-400" />
              <div><div className="text-sm font-semibold text-forest-300">Exercise Complete!</div><div className="text-xs text-white/35">~{caloriesBurned.toFixed(0)} kcal burned</div></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[{ label: 'Sets Left', value: setsLeft }, { label: 'Rest Timer', value: isPlaying ? fmt(timeLeft) : exercise.rest }, { label: 'Kcal', value: caloriesBurned.toFixed(0) }].map(({ label, value }) => (
                <div key={label} className="glass rounded-xl border border-white/6 p-3 text-center">
                  <div className="text-lg font-bold text-white">{value}</div>
                  <div className="text-xs text-white/35 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Camera feed */}
          <div className="rounded-2xl overflow-hidden border border-white/8 bg-black/30 relative" style={{ minHeight: 180 }}>
            <video ref={videoRef} className="w-full h-48 object-cover" playsInline muted style={{ display: cameraActive ? 'block' : 'none' }} />
            <canvas ref={canvasRef} width={160} height={120} className="hidden" />
            {!cameraActive ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Eye size={24} className="text-white/20" />
                <p className="text-xs text-white/30">Enable camera for AI motion detection</p>
                <button onClick={startCamera} className="px-4 py-2 rounded-xl bg-forest-500/20 border border-forest-500/30 text-forest-300 text-xs hover:bg-forest-500/30 transition-all">Enable Camera</button>
              </div>
            ) : (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm">
                  <div className={`w-2 h-2 rounded-full ${isMoving ? 'bg-forest-400 pulse-dot' : 'bg-white/20'}`} />
                  <span className="text-xs text-white/70">{isMoving ? 'Moving' : 'Still'}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm text-xs text-saffron-400">Score: {movementScore}</div>
              </div>
            )}
          </div>

          {status !== 'completed' && (
            <div className="flex gap-3">
              {status === 'idle' ? (
                <button onClick={() => { setStatus('in-progress'); setIsPlaying(true) }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-forest-500 to-forest-600 text-white font-semibold text-sm flex items-center justify-center gap-2">
                  <Play size={15} /> Start Exercise
                </button>
              ) : (
                <>
                  <button onClick={() => setIsPlaying(p => !p)}
                    className="flex-1 py-3 rounded-xl bg-white/8 border border-white/10 text-white/70 text-sm flex items-center justify-center gap-2 hover:bg-white/12 transition-all">
                    {isPlaying ? <><Pause size={14} />Pause Rest</> : <><Play size={14} />Resume Rest</>}
                  </button>
                  <button onClick={handleSetComplete}
                    className="flex-1 py-3 rounded-xl bg-forest-500/20 border border-forest-500/30 text-forest-300 text-sm font-medium flex items-center justify-center gap-2 hover:bg-forest-500/30 transition-all">
                    <CheckCircle size={14} /> Set Done
                  </button>
                </>
              )}
            </div>
          )}

          {/* YouTube results */}
          {(loadingVideo || ytResults.length > 0) && (
            <div>
              <h4 className="text-xs font-semibold text-white/35 uppercase tracking-widest mb-3">Tutorial Videos</h4>
              {loadingVideo
                ? <div className="flex items-center gap-2 text-xs text-white/30"><div className="spinner" style={{ width: 12, height: 12 }} />Fetching…</div>
                : ytResults.map((v, i) => (
                  <a key={i} href={v.watch_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/6 hover:bg-white/8 transition-all group mb-2">
                    {v.thumbnail && <img src={v.thumbnail} alt="" className="w-16 h-10 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white/70 group-hover:text-white/90 truncate">{v.title}</div>
                      <div className="text-xs text-white/30">{v.channel}</div>
                    </div>
                    <Play size={12} className="text-red-400 flex-shrink-0" />
                  </a>
                ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}