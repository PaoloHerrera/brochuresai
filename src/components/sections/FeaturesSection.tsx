import { Sparkles, Globe, FileDown, Gauge, Palette, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslate } from '../../hooks/useTranslate'
import { FEATURES_TEXT } from '../../lang/features'
import { Button } from '@heroui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import type Slider from 'react-slick'
import type { Settings } from 'react-slick'
import type { ReactNode } from 'react'
// import Slider from 'react-slick'
// import 'slick-carousel/slick/slick.css'
// import 'slick-carousel/slick/slick-theme.css'
import { EyebrowChip } from '../ui/EyebrowChip'

// Props del carrusel desde react-slick + children
type SliderProps = Settings & { children?: ReactNode }

export const FeaturesSection = () => {
  const { t } = useTranslate(FEATURES_TEXT)

  const icons = [Sparkles, Palette, FileDown, Gauge, Globe, Shield]

  // Ref del slider usando el tipo de la librería
  const sliderRef = useRef<Slider | null>(null)

  // Cargar react-slick y estilos de forma diferida cuando la sección entra en viewport
  const containerRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  const [SliderComp, setSliderComp] = useState<(new (props: SliderProps) => Slider) | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || SliderComp) return
    let cancelled = false
    ;(async () => {
      try {
        const [{ default: SliderCtor }] = await Promise.all([
          import('react-slick'),
          import('slick-carousel/slick/slick.css'),
          // Nota: removemos slick-theme.css para reducir ~12KB; no usamos dots/arrows por defecto
        ])
        if (!cancelled) setSliderComp(() => (SliderCtor as unknown as new (props: SliderProps) => Slider))
      } catch {
        // En caso de fallo al cargar, no romper la UI
      }
    })()
    return () => {
      cancelled = true
    }
  }, [inView, SliderComp])

  // Responsive: lg+ => 2 cards por slide; <md => 1 card por slide
  const [isLgUp, setIsLgUp] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsLgUp('matches' in e ? e.matches : (e as MediaQueryList).matches)
    // set initial
    handler(mq as unknown as MediaQueryList)
    // subscribe
    mq.addEventListener('change', handler as (e: MediaQueryListEvent) => void)
    return () => {
      mq.removeEventListener('change', handler as (e: MediaQueryListEvent) => void)
    }
  }, [])

  // Agrupar dinámicamente según breakpoint (sin ocultar tarjetas)
  const groupedSlides = useMemo(() => {
    const size = isLgUp ? 2 : 1
    const chunks: typeof t.items[] = []
    for (let i = 0; i < t.items.length; i += size) {
      chunks.push(t.items.slice(i, i + size))
    }
    return chunks
  }, [t, isLgUp])

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    swipeToSlide: false,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: 'ease',
  } as const

  return (
    <section className="py-20 bg-white dark:bg-slate-900 px-6 sm:px-12 lg:px-14">
      <div className="text-center mb-12">
        <EyebrowChip ariaLabel={t.eyebrow}>{t.eyebrow}</EyebrowChip>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{t.title}</h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">{t.description}</p>
      </div>

      <div className="relative">
        {/* Botones a los lados del carrusel */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="shrink-0 flex justify-center">
            <Button
              isIconOnly
              radius="full"
              variant="flat"
              className="bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm"
              onPress={() => sliderRef.current?.slickPrev?.()}
              aria-label={t.prevAria}
            >
              <ChevronLeft size={18} />
            </Button>
          </div>

          {/* Carrusel con react-slick: fade y agrupación responsive (1 en <md, 2 en md+) */}
          <div className="flex-1 min-w-0 w-full overflow-hidden" ref={containerRef}>
            {SliderComp ? (
              <SliderComp ref={sliderRef as React.RefObject<Slider>} {...settings}>
                {groupedSlides.map((group, slideIdx) => (
                  <div key={slideIdx} className="px-3">
                    <div className={`grid grid-cols-1 ${isLgUp ? 'lg:grid-cols-2' : ''} gap-6 justify-items-center`}>
                      {group.map((item, i) => {
                        const absoluteIndex = slideIdx * (isLgUp ? 2 : 1) + i
                        const Icon = icons[absoluteIndex % icons.length]
                        return (
                          <div
                            key={i}
                            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/60 backdrop-blur p-7 md:p-9 shadow-sm hover:shadow-md transition-all h-full w-full"
                          >
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-5 text-center md:text-left">
                              <div className="flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-400/30 group-hover:scale-105 transition-transform mx-auto md:mx-0 mb-3 md:mb-0 shrink-0">
                                <Icon size={24} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white text-lg md:text-xl">{item.title}</h3>
                                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-1">{item.description}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </SliderComp>
            ) : (
              // Placeholder para evitar salto de layout antes de cargar el carrusel
              <div className="h-64 sm:h-72 lg:h-80" />
            )}
          </div>

          <div className="shrink-0 flex justify-center">
            <Button
              isIconOnly
              radius="full"
              variant="flat"
              className="bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm"
              onPress={() => sliderRef.current?.slickNext?.()}
              aria-label={t.nextAria}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}