/**
 * wovie-rating — Web Component
 * Кастомный HTML-элемент для отображения рейтинга фильма.
 *
 * Использование:
 *   <wovie-rating value="8.4" max="10"></wovie-rating>
 *   <wovie-rating value="7.2" max="10" label="IMDb"></wovie-rating>
 *
 * Атрибуты:
 *   value  — числовой рейтинг
 *   max    — максимальное значение (по умолчанию 10)
 *   label  — подпись (опционально)
 */
class WovieRating extends HTMLElement {
  // Объявляем атрибуты, за которыми следим
  static get observedAttributes() {
    return ['value', 'max', 'label']
  }

  constructor() {
    super()
    // Shadow DOM изолирует стили компонента от страницы
    this.attachShadow({ mode: 'open' })
    this._animating = false
  }

  // Вызывается при добавлении элемента в DOM
  connectedCallback() {
    this.render()
    this._addHoverListeners()
  }

  // Вызывается при изменении атрибута
  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) this.render()
  }

  // Добавить hover-анимацию на звёзды
  _addHoverListeners() {
    const root = this.shadowRoot
    if (!root) return

    root.addEventListener('mouseover', (e) => {
      const star = e.target.closest('.star')
      if (!star) return
      const idx = parseInt(star.dataset.idx)
      root.querySelectorAll('.star').forEach((s, i) => {
        s.classList.toggle('hovered', i <= idx)
      })
    })

    root.addEventListener('mouseleave', () => {
      root.querySelectorAll('.star').forEach(s => s.classList.remove('hovered'))
    })
  }

  render() {
    const value = parseFloat(this.getAttribute('value') ?? '0')
    const max   = parseFloat(this.getAttribute('max')   ?? '10')
    const label = this.getAttribute('label') ?? ''

    // Переводим в шкалу 0–5 звёзд
    const starsCount = 5
    const filled = Math.round((value / max) * starsCount)

    const stars = Array.from({ length: starsCount }, (_, i) => {
      const isFilled = i < filled
      return `
        <span
          class="star ${isFilled ? 'filled' : 'empty'}"
          data-idx="${i}"
          aria-label="${isFilled ? 'filled star' : 'empty star'}"
        >${isFilled ? '★' : '☆'}</span>
      `
    }).join('')

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: inherit;
          user-select: none;
        }

        .stars {
          display: inline-flex;
          gap: 1px;
        }

        .star {
          font-size: 1rem;
          line-height: 1;
          cursor: default;
          transition: transform 0.15s ease, color 0.15s ease;
          display: inline-block;
        }

        .star.filled {
          color: #F5A623;
        }

        .star.empty {
          color: rgba(255, 255, 255, 0.2);
        }

        .star.hovered {
          transform: scale(1.35);
          color: #F5A623;
        }

        .score {
          font-weight: 700;
          font-size: 0.85rem;
          color: #F5A623;
          margin-left: 4px;
        }

        .label {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-left: 2px;
        }
      </style>

      <div class="stars" role="img" aria-label="Rating: ${value} out of ${max}">
        ${stars}
      </div>
      <span class="score">${value.toFixed(1)}</span>
      ${label ? `<span class="label">${label}</span>` : ''}
    `

    // Переподключить hover (innerHTML сбрасывает listeners)
    this._addHoverListeners()
  }
}

// Регистрируем кастомный элемент
customElements.define('wovie-rating', WovieRating)
