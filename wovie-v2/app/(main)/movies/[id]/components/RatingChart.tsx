'use client'
import { useRef, useEffect, useState } from 'react'

interface Props {
  score: number   // 0–10
  votes: number
  accent: string  // hex цвет
}

/**
 * RatingChart — круговой SVG-индикатор рейтинга.
 *
 * JS-работа с SVG:
 *  - Вычисляем stroke-dasharray / stroke-dashoffset через JS (не CSS)
 *  - addEventListener на SVG-элементах (mouseenter, mouseleave, click)
 *  - Динамически меняем атрибуты SVG через setAttribute
 *  - Создаём SVG-элементы programmatically через useRef + прямой доступ к DOM
 */
export default function RatingChart({ score, votes, accent }: Props) {
  const svgRef   = useRef<SVGSVGElement>(null)
  const arcRef   = useRef<SVGCircleElement>(null)
  const textRef  = useRef<SVGTextElement>(null)
  const [hovered, setHovered] = useState(false)
  const [animated, setAnimated] = useState(false)

  const SIZE   = 120
  const STROKE = 8
  const R      = (SIZE - STROKE) / 2        // радиус
  const CIRC   = 2 * Math.PI * R            // длина окружности
  const pct    = Math.min(score / 10, 1)
  const dash   = CIRC * pct                 // заполненная часть дуги
  const gap    = CIRC - dash                // пустая часть

  // Анимируем дугу через JS setAttribute при монтировании
  useEffect(() => {
    const arc  = arcRef.current
    const text = textRef.current
    if (!arc || !text) return

    // Старт: дуга = 0
    arc.setAttribute('stroke-dasharray', `0 ${CIRC}`)
    arc.setAttribute('stroke', accent)

    // Плавная анимация через requestAnimationFrame
    let start: number | null = null
    const duration = 900 // ms

    const animate = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentDash = CIRC * pct * eased

      // Меняем атрибуты SVG напрямую через JS
      arc.setAttribute('stroke-dasharray', `${currentDash} ${CIRC - currentDash}`)
      text.setAttribute('opacity', String(eased))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setAnimated(true)
      }
    }

    // Небольшая задержка для появления
    const timer = setTimeout(() => requestAnimationFrame(animate), 300)
    return () => clearTimeout(timer)
  }, [score, accent, CIRC, pct])

  // JS-события на SVG-элементах через addEventListener
  useEffect(() => {
    const arc = arcRef.current
    const svg = svgRef.current
    if (!arc || !svg) return

    const onEnter = () => {
      setHovered(true)
      // Меняем атрибут через setAttribute
      arc.setAttribute('stroke-width', String(STROKE + 3))
    }

    const onLeave = () => {
      setHovered(false)
      arc.setAttribute('stroke-width', String(STROKE))
    }

    // Добавляем события прямо на SVG-элемент
    svg.addEventListener('mouseenter', onEnter)
    svg.addEventListener('mouseleave', onLeave)

    return () => {
      svg.removeEventListener('mouseenter', onEnter)
      svg.removeEventListener('mouseleave', onLeave)
    }
  }, [STROKE])

  const formatVotes = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
    return String(n)
  }

  return (
    <div className="flex flex-col items-center gap-1 select-none cursor-default">
      {/* SVG-элемент — круговой индикатор */}
      <svg
        ref={svgRef}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Rating ${score.toFixed(1)} out of 10`}
        style={{ transition: 'transform 0.3s ease', transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
      >
        {/* Фоновое кольцо */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={STROKE}
        />

        {/* Цветная дуга — stroke-dasharray задаётся через JS */}
        <circle
          ref={arcRef}
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={accent}
          strokeWidth={STROKE}
          strokeLinecap="round"
          // Поворачиваем на -90° чтобы дуга начиналась сверху
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{ filter: hovered ? `drop-shadow(0 0 6px ${accent})` : 'none', transition: 'filter 0.3s ease' }}
        />

        {/* Текст с оценкой — opacity тоже управляется через JS */}
        <text
          ref={textRef}
          x={SIZE / 2}
          y={SIZE / 2 - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={accent}
          fontSize="22"
          fontWeight="700"
          opacity="0"
        >
          {score.toFixed(1)}
        </text>

        {/* Подпись /10 */}
        <text
          x={SIZE / 2}
          y={SIZE / 2 + 16}
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="11"
          fontWeight="500"
        >
          / 10
        </text>

        {/* Метка TMDB */}
        <text
          x={SIZE / 2}
          y={SIZE / 2 + 30}
          textAnchor="middle"
          fill="rgba(255,255,255,0.2)"
          fontSize="9"
          letterSpacing="1"
        >
          TMDB
        </text>
      </svg>

      {/* Голоса */}
      <span className="text-xs text-white/30 tabular-nums">
        {formatVotes(votes)} votes
      </span>
    </div>
  )
}
