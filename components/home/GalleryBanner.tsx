'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { galleryImages } from '@/app/gallery/gallery-data'

export default function GalleryBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Auto-advance slideshow every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext()
    }, 4000)

    return () => clearInterval(interval)
  }, [currentIndex])

  const handleNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % galleryImages.length)
      setIsTransitioning(false)
    }, 500)
  }

  const handlePrev = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
      setIsTransitioning(false)
    }, 500)
  }

  const goToSlide = (index: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 500)
  }

  // Show 5 images at once (current + 2 before + 2 after)
  const getVisibleImages = () => {
    const visible = []
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + galleryImages.length) % galleryImages.length
      visible.push({
        ...galleryImages[index],
        position: i
      })
    }
    return visible
  }

  const visibleImages = getVisibleImages()

  return (
    <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 py-16 px-4 overflow-hidden">
      {/* Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Our Work Showcase
        </h2>
        <p className="text-gray-300 text-lg">
          See the quality craftsmanship we deliver every day
        </p>
      </div>

      {/* Slideshow Container */}
      <div className="relative max-w-7xl mx-auto">
        {/* Images */}
        <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
          {visibleImages.map((image, idx) => {
            const position = image.position
            const isCurrent = position === 0
            
            // Calculate positioning and sizing
            let transform = ''
            let zIndex = 0
            let opacity = 0.4
            let scale = 0.7
            
            if (position === 0) {
              // Center image
              transform = 'translateX(0) scale(1)'
              zIndex = 30
              opacity = 1
              scale = 1
            } else if (position === -1) {
              // Left 1
              transform = 'translateX(-110%) scale(0.85)'
              zIndex = 20
              opacity = 0.7
            } else if (position === 1) {
              // Right 1
              transform = 'translateX(110%) scale(0.85)'
              zIndex = 20
              opacity = 0.7
            } else if (position === -2) {
              // Left 2
              transform = 'translateX(-220%) scale(0.7)'
              zIndex = 10
              opacity = 0.4
            } else if (position === 2) {
              // Right 2
              transform = 'translateX(220%) scale(0.7)'
              zIndex = 10
              opacity = 0.4
            }

            return (
              <div
                key={`${image.id}-${idx}`}
                className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-in-out cursor-pointer"
                style={{
                  transform,
                  zIndex,
                  opacity: isTransitioning ? 0.3 : opacity,
                  width: '60%',
                  maxWidth: '600px',
                }}
                onClick={() => isCurrent ? null : goToSlide((currentIndex + position + galleryImages.length) % galleryImages.length)}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 80vw, 600px"
                    priority={isCurrent}
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 border-4 border-white/30 rounded-xl pointer-events-none" />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white text-gray-900 p-4 rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="Previous image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white text-gray-900 p-4 rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="Next image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {galleryImages.slice(0, 10).map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === idx
                  ? 'bg-white w-8 h-3'
                  : 'bg-white/40 hover:bg-white/60 w-3 h-3'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
          {galleryImages.length > 10 && (
            <span className="text-white/60 text-sm self-center ml-2">
              {currentIndex + 1} / {galleryImages.length}
            </span>
          )}
        </div>

        {/* View Full Gallery Link */}
        <div className="text-center mt-8">
          <a
            href="/gallery"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
          >
            <span>View Full Gallery</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
