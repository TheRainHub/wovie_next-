'use client'
import { useState, useEffect } from 'react'

/**
 * useAccentColor — извлекает доминирующий цвет постера через Canvas API.
 *
 * Явное использование Canvas:
 *   1. document.createElement('canvas') — создаём canvas
 *   2. canvas.getContext('2d')          — получаем 2D-контекст
 *   3. ctx.drawImage(img, ...)          — рисуем постер на canvas
 *   4. ctx.getImageData(...)            — читаем пиксели
 *   5. Ищем доминирующий цвет по кластеризации пикселей
 */
export function useAccentColor(imageUrl: string | undefined) {
  const [accent, setAccent] = useState({
    hex: '#F5C518',
    rgb: 'rgb(245, 197, 24)',
    rgba: (alpha: number) => `rgba(245, 197, 24, ${alpha})`,
    r: 245, g: 197, b: 24,
    isDark: false,
  })

  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageUrl

    img.onload = () => {
      try {
        // 1. Создаём Canvas и получаем 2D-контекст
        const canvas = document.createElement('canvas')
        const SIZE = 64 // уменьшенный размер для производительности
        canvas.width  = SIZE
        canvas.height = SIZE
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 2. Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0, SIZE, SIZE)

        // 3. Читаем пиксели через getImageData
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE)

        // 4. Собираем цвета, игнорируем слишком тёмные и слишком светлые
        const buckets: Record<string, { r: number; g: number; b: number; count: number }> = {}

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]

          if (a < 128) continue // прозрачные — пропускаем

          // Игнорируем почти чёрные и почти белые пиксели
          const brightness = (r + g + b) / 3
          if (brightness < 30 || brightness > 220) continue

          // Квантизируем в бакеты по 32 для группировки похожих цветов
          const key = `${Math.floor(r / 32)}_${Math.floor(g / 32)}_${Math.floor(b / 32)}`
          if (!buckets[key]) buckets[key] = { r: 0, g: 0, b: 0, count: 0 }
          buckets[key].r += r
          buckets[key].g += g
          buckets[key].b += b
          buckets[key].count++
        }

        // 5. Находим самый частый бакет (доминирующий цвет)
        let dominant = { r: 245, g: 197, b: 24 }
        let maxCount = 0

        for (const bucket of Object.values(buckets)) {
          if (bucket.count > maxCount) {
            maxCount = bucket.count
            dominant = {
              r: Math.round(bucket.r / bucket.count),
              g: Math.round(bucket.g / bucket.count),
              b: Math.round(bucket.b / bucket.count),
            }
          }
        }

        // 6. Повышаем насыщенность для более яркого акцента
        const boosted = boostSaturation(dominant.r, dominant.g, dominant.b, 1.5)

        const brightness = (boosted.r * 299 + boosted.g * 587 + boosted.b * 114) / 1000

        setAccent({
          hex: rgbToHex(boosted.r, boosted.g, boosted.b),
          rgb: `rgb(${boosted.r}, ${boosted.g}, ${boosted.b})`,
          rgba: (alpha: number) => `rgba(${boosted.r}, ${boosted.g}, ${boosted.b}, ${alpha})`,
          r: boosted.r,
          g: boosted.g,
          b: boosted.b,
          isDark: brightness < 128,
        })
      } catch (e) {
        // Оставляем дефолтный цвет при ошибке
      }
    }
  }, [imageUrl])

  return accent
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

function boostSaturation(r: number, g: number, b: number, factor: number) {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
      case gn: h = ((bn - rn) / d + 2) / 6; break
      case bn: h = ((rn - gn) / d + 4) / 6; break
    }
  }

  s = Math.min(1, s * factor)

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let ro: number, go: number, bo: number
  if (s === 0) {
    ro = go = bo = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    ro = hue2rgb(p, q, h + 1 / 3)
    go = hue2rgb(p, q, h)
    bo = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(ro * 255),
    g: Math.round(go * 255),
    b: Math.round(bo * 255),
  }
}
