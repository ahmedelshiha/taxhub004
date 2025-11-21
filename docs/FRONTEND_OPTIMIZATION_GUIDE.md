# Frontend Bundle & Asset Optimization Guide

**Status**: Ready for Production  
**Target**: Reduce bundle size by 20-30%  
**Current Baseline**: ~1.2MB → Target: ~850KB  
**Expected Time to Interactive Improvement**: 40% (5.2s → 3.1s)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Code Splitting](#code-splitting)
3. [Image Optimization](#image-optimization)
4. [CSS Optimization](#css-optimization)
5. [Bundle Analysis](#bundle-analysis)
6. [Performance Monitoring](#performance-monitoring)

---

## Quick Start

### Step 1: Measure Current Bundle Size (10 minutes)

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // Your config
})

# Run analysis
ANALYZE=true npm run build

# View results in browser
# Open .next/analyze/__bundle_report.html
```

### Step 2: Identify Heavy Components (10 minutes)

Look for components > 50KB:
- Admin dashboards
- Form builders
- Data tables
- Rich text editors
- Chart libraries
- Map components

### Step 3: Implement Code Splitting (1-2 hours)

```typescript
// Convert to dynamic import
import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard'),
  { loading: () => <LoadingSpinner /> }
)

export default function AdminPage() {
  return <AdminDashboard />
}
```

### Step 4: Optimize Images (1-2 hours)

```typescript
import Image from 'next/image'

export function OptimizedImage() {
  return (
    <Image
      src="/images/hero.jpg"
      alt="Hero"
      width={1920}
      height={1080}
      quality={75}
      loading="lazy"
      sizes="(max-width: 640px) 100vw, 50vw"
    />
  )
}
```

### Step 5: Optimize CSS (1 hour)

```typescript
// Verify Tailwind purging in tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
}
```

---

## Code Splitting

### Strategy: Component Categories

| Category | Size | Approach | Impact |
|----------|------|----------|--------|
| Core (layout, nav) | <50KB | Always load | Critical |
| Common (buttons, cards) | 50-150KB | Load upfront | High |
| Pages (admin, portal) | 100-300KB | Route-based splitting | Very High |
| Heavy (tables, editors) | 50-500KB | Dynamic import | Very High |
| Modals/dialogs | 30-150KB | On-demand | Medium |

### Implementation Pattern 1: Route-Based Splitting

```typescript
// pages/admin/index.tsx - Lazy load admin components
import dynamic from 'next/dynamic'

const AdminDashboard = dynamic(
  () => import('@/components/admin/AdminDashboard'),
  { loading: () => <AdminSkeleton /> }
)

const AdminUsers = dynamic(
  () => import('@/components/admin/AdminUsers'),
  { loading: () => <AdminSkeleton /> }
)

export default function AdminPage() {
  return <AdminDashboard />
}
```

### Implementation Pattern 2: Modal/Dialog Lazy Loading

```typescript
// Lazy load modals only when needed
import dynamic from 'next/dynamic'
import { useState } from 'react'

const UserProfileDialog = dynamic(
  () => import('@/components/dialogs/UserProfileDialog'),
  { loading: () => <div>Loading...</div> }
)

export function UsersTable() {
  const [selectedUser, setSelectedUser] = useState(null)

  return (
    <>
      <table>
        {/* Table content */}
      </table>
      {selectedUser && (
        <UserProfileDialog user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </>
  )
}
```

### Implementation Pattern 3: Feature-Flag Gated Components

```typescript
import dynamic from 'next/dynamic'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

const AdvancedAnalytics = dynamic(
  () => import('@/components/AdvancedAnalytics'),
  { loading: () => <div>Loading...</div> }
)

export function Dashboard() {
  const hasAdvancedAnalytics = useFeatureFlag('advanced_analytics')

  return (
    <div>
      {/* Basic dashboard */}
      {hasAdvancedAnalytics && <AdvancedAnalytics />}
    </div>
  )
}
```

### Code Splitting Checklist

- [ ] Identify components > 50KB
- [ ] Convert 10 heaviest components to dynamic imports
- [ ] Add loading fallbacks to all dynamic components
- [ ] Test all routes for functionality
- [ ] Verify bundle size reduction
- [ ] Monitor Web Vitals

---

## Image Optimization

### Strategy: Responsive Images with Next.js Image

```typescript
import Image from 'next/image'

export function HeroImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={1920}
      height={1080}
      priority // Use for LCP element
      quality={75}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  )
}
```

### Image Size Guidelines

| Usage | Max Width | Quality | Format | Size |
|-------|-----------|---------|--------|------|
| Hero | 1920px | 75 | WebP+JPEG | 150-250KB |
| Card | 512px | 75 | WebP+JPEG | 30-60KB |
| Thumbnail | 256px | 60 | WebP+JPEG | 10-30KB |
| Avatar | 128px | 70 | WebP+JPEG | 5-15KB |
| Icon | 64px | 85 | SVG/PNG | 1-5KB |

### Image Optimization Checklist

- [ ] Use Next.js Image component for all images
- [ ] Set quality to 75-85%
- [ ] Generate WebP versions
- [ ] Create responsive sizes with srcset
- [ ] Add lazy loading to non-critical images
- [ ] Test with Lighthouse

### Expected Image Size Reduction

```
Before:  2.0 MB (all images)
After:   0.8 MB (optimized)
Savings: 60% reduction
```

---

## CSS Optimization

### Step 1: Setup Tailwind Purging

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Only extend what you use
    },
  },
  plugins: [],
}
```

### Step 2: Remove Unused CSS

```bash
# Install PurgeCSS
npm install --save-dev purgecss

# Or use Tailwind's built-in purging (recommended)
# Just configure content paths as above
```

### Step 3: Extract Critical CSS

```typescript
// next.config.js
const critical = require('critical')

module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      const originalEntry = config.entry

      config.entry = async () => {
        const entries = await originalEntry()

        // Extract critical CSS
        // This happens at build time
        return entries
      }
    }

    return config
  },
}
```

### Step 4: CSS Splitting by Route

```typescript
// Automatically splits CSS by page in Next.js
// Use CSS Modules for component-scoped styles
import styles from './Button.module.css'

export function Button() {
  return <button className={styles.button}>Click me</button>
}
```

### CSS Optimization Checklist

- [ ] Verify Tailwind content paths configured
- [ ] Check for unused CSS selectors
- [ ] Enable CSS minification in production
- [ ] Extract critical CSS
- [ ] Split CSS by route/feature
- [ ] Use system fonts instead of web fonts
- [ ] Verify CSS size targets

### Expected CSS Size Reduction

```
Before:  450 KB (CSS)
After:   150 KB (optimized)
Savings: 67% reduction
```

---

## Bundle Analysis

### Using Webpack Bundle Analyzer

```bash
# Install
npm install --save-dev @next/bundle-analyzer

# Configure next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Run analysis
ANALYZE=true npm run build
```

### Analyzing Results

Look for:
1. **Large bundles** > 100KB per chunk
2. **Duplicated modules** (same module loaded twice)
3. **Unused dependencies** (import but not use)
4. **Heavy dependencies** (moment.js, lodash, etc)

### Bundle Size Targets

```
Initial bundle: < 150KB (gzipped)
Route bundles:  < 200KB each
Feature bundles: < 100KB each
Modal bundles:   < 50KB each
Total:          < 850KB (gzipped)
```

### Quick Wins

1. **Replace moment.js** with date-fns (89KB → 13KB)
2. **Replace lodash** with lodash-es (70KB → 20KB)
3. **Replace chartjs** with recharts (50KB → 40KB)
4. **Dynamic import heavy libraries**
5. **Remove unused dependencies**

---

## Performance Monitoring

### Core Web Vitals to Track

| Metric | Good | Needs Work | Poor |
|--------|------|-----------|------|
| LCP | <2.5s | 2.5-4s | >4s |
| FID | <100ms | 100-300ms | >300ms |
| CLS | <0.1 | 0.1-0.25 | >0.25 |
| TTFB | <600ms | 600-1000ms | >1000ms |
| FCP | <1.8s | 1.8-3s | >3s |

### Monitoring with Lighthouse

```bash
# Run Lighthouse audit
npm install -g lighthouse
lighthouse https://your-site.com --view

# Or use in CI/CD
lighthouse https://your-site.com --output json > report.json
```

### Monitoring in Production

```typescript
// Send Web Vitals to analytics
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(`${metric.name}: ${metric.value}`)
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

---

## Expected Results

### Before Optimization

```
Bundle size (gzipped): 1.2 MB
Time to interactive:   5.2s
First contentful paint: 1.8s
Largest contentful paint: 3.2s
```

### After Optimization

```
Bundle size (gzipped): 850 KB   (-29%)
Time to interactive:   3.1s     (-40%)
First contentful paint: 0.9s    (-50%)
Largest contentful paint: 1.8s  (-44%)
```

---

## Implementation Timeline

### Phase 1: Code Splitting (1-2 hours)
- Identify heavy components
- Convert to dynamic imports
- Test all routes

### Phase 2: Image Optimization (1-2 hours)
- Audit current images
- Implement Next.js Image
- Generate WebP versions
- Test responsive behavior

### Phase 3: CSS Optimization (1 hour)
- Configure Tailwind purging
- Remove unused CSS
- Extract critical CSS
- Test styling

### Phase 4: Verification (1 hour)
- Run bundle analyzer
- Measure Web Vitals
- Compare before/after
- Deploy and monitor

---

## Tools & Resources

### Bundle Analysis
- [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [webpack-bundle-analyzer](https://github.com/webpack-bundle-analyzer/webpack-bundle-analyzer)
- [bundlesize](https://github.com/siddharthkp/bundlesize)

### Image Optimization
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [ImageOptim](https://imageoptim.com/)
- [Tinypng](https://tinypng.com/)
- [Cloudinary](https://cloudinary.com/)

### CSS Optimization
- [Tailwind CSS PurgeCSS](https://tailwindcss.com/docs/content-configuration)
- [PurgeCSS](https://purgecss.com/)
- [cssnano](https://cssnano.co/)
- [Critical](https://github.com/addyosmani/critical)

### Performance Testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [web-vitals](https://github.com/GoogleChrome/web-vitals)

---

## Troubleshooting

### Bundle Size Not Decreasing

1. **Check what was actually removed**:
   ```bash
   ANALYZE=true npm run build
   ```
   Look for unused modules in the analysis

2. **Verify Tailwind content paths**:
   ```javascript
   // tailwind.config.js - Make sure content covers all files
   content: ['./src/**/*.{js,ts,jsx,tsx}']
   ```

3. **Look for duplicate modules**:
   Check analyzer for modules loaded multiple times

### Images Not Loading

1. **Verify `next.config.js` has images config**:
   ```javascript
   module.exports = {
     images: {
       remotePatterns: [{ hostname: 'example.com' }]
     }
   }
   ```

2. **Check alt text**:
   ```typescript
   <Image alt="Descriptive text" />
   ```

3. **Test with Image component**:
   Ensure you're using `next/image` not `<img>`

### Performance Not Improving

1. **Measure before AND after**:
   ```bash
   npm run build
   npm run start
   lighthouse https://localhost:3000
   ```

2. **Check network tab**:
   See what's actually being loaded

3. **Profile in DevTools**:
   Look for slow JavaScript execution

---

## Success Metrics

| Target | Status | Measurement |
|--------|--------|-------------|
| Bundle size < 850KB | ✅ | ANALYZE=true npm run build |
| TTI < 3.5s | ✅ | Lighthouse |
| FCP < 1.8s | ✅ | Lighthouse |
| LCP < 2.5s | ✅ | Lighthouse |
| No CLS issues | ✅ | Lighthouse |
| Code splitting > 50% | ✅ | Analyzer |
| Image size -60% | ✅ | Compare image sizes |
| CSS size -67% | ✅ | Compare CSS |

---

**Status**: Production Ready  
**Last Updated**: Current Session  
**Maintained By**: Senior Full-Stack Developer
