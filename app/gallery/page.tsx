'use client'


import { useState } from 'react'
import Image from 'next/image'
import { galleryImages } from './gallery-data'

// Remove the hardcoded galleryImages array
// ... rest of the component stays the same



interface GalleryImage {
  id: number
  src: string
  alt: string
  category: 'before-after' | 'collision-repair' | 'paint-work' | 'custom-work' | 'all'
  title?: string
}
export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  const categories = [
    { id: 'all', label: 'All Work', icon: '🖼️' },
    { id: 'before-after', label: 'Before & After', icon: '↔️' },
    { id: 'collision-repair', label: 'Collision Repair', icon: '🚗' },
    { id: 'paint-work', label: 'Paint & Refinishing', icon: '🎨' },
    { id: 'custom-work', label: 'Custom Work', icon: '⭐' }
  ]

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Work Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our portfolio of expert auto body repairs, collision restoration, 
            and custom paint work. Over 40 years of quality craftsmanship.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedCategory === category.id
                  ? 'bg-maroon text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredImages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                onClick={() => setSelectedImage(image)}
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      🔍
                    </span>
                  </div>
                </div>
                {image.title && (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {image.title}
                    </h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No images in this category yet.</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-maroon text-white rounded-lg shadow-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Restore Your Vehicle?</h2>
          <p className="text-lg mb-6">
            Get a free estimate on your auto body repair today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/schedule"
              className="bg-white text-maroon px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Schedule Free Estimate
            </a>
            <a
              href="tel:+12164818696"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-maroon transition-colors"
            >
              Call (216) 481-8696
            </a>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          {selectedImage.title && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-6 py-3 rounded-lg">
              <p className="text-lg font-semibold">{selectedImage.title}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
