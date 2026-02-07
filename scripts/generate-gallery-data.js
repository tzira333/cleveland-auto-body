const fs = require('fs');
const path = require('path');

const galleryDir = path.join(__dirname, '../public/gallery');
const outputFile = path.join(__dirname, '../app/gallery/gallery-data.ts');

// Get all image files
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic'];
const files = fs.readdirSync(galleryDir)
  .filter(file => {
    const ext = path.extname(file).toLowerCase();
    return imageExtensions.includes(ext);
  });

// Auto-categorize based on filename keywords
function categorizeImage(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('before') || lower.includes('after')) return 'before-after';
  if (lower.includes('collision') || lower.includes('damage')) return 'collision-repair';
  if (lower.includes('paint') || lower.includes('refinish')) return 'paint-work';
  if (lower.includes('custom')) return 'custom-work';
  return 'all';
}

// Generate TypeScript data
const galleryData = files.map((file, index) => {
  const name = path.parse(file).name;
  const title = name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    id: index + 1,
    src: `/gallery/${file}`,
    alt: title,
    category: categorizeImage(file),
    title: title
  };
});

// Write to TypeScript file
const tsContent = `// Auto-generated gallery data
export interface GalleryImage {
  id: number
  src: string
  alt: string
  category: 'before-after' | 'collision-repair' | 'paint-work' | 'custom-work' | 'all'
  title?: string
}

export const galleryImages: GalleryImage[] = ${JSON.stringify(galleryData, null, 2)}
`;

fs.writeFileSync(outputFile, tsContent);

console.log(`✓ Generated gallery data for ${files.length} images`);
console.log(`✓ Output: ${outputFile}`);
