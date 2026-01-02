# Heritage Roots Tracing App - Design Guidelines

## Design Approach
**Reference-Based**: Drawing from Ancestry.com's genealogy patterns, Airbnb's discovery interface, and museum archive presentations. Warm, nostalgic aesthetic that honors heritage while maintaining modern usability.

## Typography System
**Headings**: Playfair Display (400, 600, 700 weights)
- Hero headlines: text-5xl to text-7xl
- Section titles: text-3xl to text-4xl
- Card titles: text-xl to text-2xl

**Body**: Lato (300, 400, 600 weights)
- Body text: text-base to text-lg
- Captions: text-sm
- Metadata: text-xs

## Layout System
**Spacing Primitives**: Use Tailwind units of 3, 6, 8, 12, 16, 20, 24
- Micro spacing: p-3, gap-3
- Component spacing: p-6, p-8
- Section padding: py-16, py-20, py-24
- Container: max-w-7xl with px-6

## Component Library

### Navigation
**Primary Nav**: Transparent overlay on hero transitioning to warm cream background on scroll. Logo left, main links center, CTA button right. Sticky position with subtle shadow after scroll.

### Hero Section
**Full-width hero with large imagery**: 85vh height featuring sepia-toned or warm-filtered historical Punjab imagery (village landscapes, vintage architecture). Centered content with large Playfair Display headline, descriptive tagline, dual CTA buttons (primary: "Trace Your Roots", secondary: "Explore Heritage"). Buttons have backdrop-blur-md backgrounds with subtle warm tints. Overlay gradient from transparent to dark at bottom for text legibility.

### Cards
**Heritage Discovery Cards**: Rounded corners (rounded-xl), warm shadow, hover lift effect
- Image-first layout with 16:9 or 4:3 aspect ratios
- Overlay gradient on images for text placement
- Playfair Display titles over images, Lato metadata below
- Used for: Village tours, landmark showcases, historical timeline entries

**Profile Directory Cards**: Grid layout (2 columns mobile, 3-4 desktop)
- Circular profile images
- Name in Playfair Display, location/details in Lato
- Subtle border, cream/warm background on hover

### Heritage Tours Page
**Layout**: Masonry grid for village cards (varying heights based on content)
- Filter sidebar with accordion sections (Region, Era, Type)
- Large feature cards for premium tours (full-width or 2-column)
- Map integration section showing Punjab/Pakistan geography with clickable village markers

### Historical Images Gallery
**Presentation**: Pinterest-style masonry grid with modal expansion
- 1947 partition images, vintage Lahore landmarks, village heritage
- Metadata overlays: date, location, description
- Lightbox view with historical context panels
- Timeline scrubber for chronological browsing

### Services Section
**Virtual Home Visits**: Split layout with video preview left, booking form right
- Calendar integration for scheduling
- Package options displayed as comparison cards

**Heritage Imports**: Product showcase grid
- Items: vintage textiles, artifacts, reproductions
- E-commerce card pattern with image galleries, pricing, add-to-cart

### Footer
**Rich footer**: 4-column layout
- Column 1: Brand story snippet with logo
- Column 2: Quick links (Tours, Directory, Services)
- Column 3: Resources (Historical timeline, Blog, FAQ)
- Column 4: Newsletter signup with heritage-themed CTA
- Bottom bar: Social links, language selector (Punjabi/Urdu/English), legal links

## Images Strategy

**Hero Image**: Large, emotional sepia-toned photograph of Punjab countryside or historical Lahore landmark at golden hour. Full-width, 85vh height.

**Section Headers**: Each major section (Tours, Directory, Services) includes medium-height banner images (40vh) with warm filters showing relevant imagery (village scenes, family gatherings, historical architecture).

**Content Images**:
- Village tour cards: Contemporary photos of Pakistani villages with warm color grading
- Landmarks gallery: Historical and modern Lahore photographs
- 1947 timeline: Archival black-and-white photographs with sepia tones
- Profile directory: User-uploaded family photos in circular frames

**Background Textures**: Subtle paper/parchment textures on content sections for heritage feel. Use sparingly - only on testimonial/story sections.

## Visual Treatments
- Warm sepia/vintage filters on historical images
- Soft vignettes on hero and feature images
- Cream (#FFF9F0), warm beige (#F5F1E8), terracotta accents for backgrounds
- Generous whitespace with intentional density in gallery sections
- Avoid harsh shadows; use warm, soft shadows (with slight orange/brown tints)

## Interaction Patterns
- Smooth scroll with parallax on hero image (subtle)
- Card hover: gentle lift (translate-y-1) with shadow increase
- Image galleries: crossfade transitions
- Timeline scrubber: smooth horizontal scroll with snap points
- Minimal animations overall - focus on content revelation over distraction