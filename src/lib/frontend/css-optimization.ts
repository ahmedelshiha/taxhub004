/**
 * CSS Optimization Strategies
 *
 * Reduces CSS bundle size and improves rendering performance:
 * - CSS tree-shaking with Tailwind
 * - Critical CSS extraction
 * - CSS minification
 * - Media query optimization
 * - Redundant rule removal
 *
 * Target: Reduce CSS by 40-60%
 * Current baseline: ~450KB → Target: ~200KB
 */

/**
 * CSS optimization configuration
 */
export const CSS_OPTIMIZATION_CONFIG = {
  // CSS file size targets
  targets: {
    critical: 30, // KB - inline critical CSS
    main: 100, // KB - main stylesheet
    utilities: 150, // KB - utility classes (Tailwind)
    total: 200, // KB - all CSS combined
  },

  // CSS minification settings
  minification: {
    enabled: true,
    removeComments: true,
    removeWhitespace: true,
    removeRedundant: true,
  },

  // Tailwind PurgeCSS configuration
  tailwind: {
    content: [
      './src/app/**/*.{js,ts,jsx,tsx}',
      './src/components/**/*.{js,ts,jsx,tsx}',
      './src/pages/**/*.{js,ts,jsx,tsx}',
    ],
    enabled: true,
  },

  // CSS splitting configuration
  splitting: {
    criticalCSS: true,
    perPageCSS: true,
    themeCSS: true,
  },
}

/**
 * Critical CSS rules
 * Inline these in <head> for faster first paint
 */
export const CRITICAL_CSS_RULES = [
  // Layout and basic structure
  'body',
  '.container',
  '.layout',
  '.header',
  '.nav',
  '.main',
  '.sidebar',

  // Typography
  'h1, h2, h3, h4, h5, h6',
  'p',
  'a',
  '.text-*',

  // Essential buttons
  '.btn-primary',
  '.btn-secondary',
  'button',

  // Loading states
  '.loading',
  '.skeleton',
  '.placeholder',

  // Navigation
  '.navbar',
  '.menu',
  '.breadcrumb',

  // Alerts and notifications
  '.alert',
  '.notification',
  '.toast',

  // Form basics
  'form',
  'input',
  'label',
  '.form-group',

  // Images
  'img',
  '.image',
  '.avatar',

  // Common utilities
  '.hidden',
  '.visible',
  '.text-center',
  '.text-left',
  '.text-right',
]

/**
 * CSS anti-patterns to avoid
 */
export const CSS_ANTI_PATTERNS = [
  {
    name: 'Unused CSS',
    problem: 'Selector not used in any HTML',
    solution: 'Use PurgeCSS or Tailwind purgecss',
    estimatedSavings: '20-40%',
  },
  {
    name: 'Redundant Rules',
    problem: 'Same styles defined multiple times',
    solution: 'Extract to variables/mixins',
    estimatedSavings: '5-15%',
  },
  {
    name: 'Inline Styles',
    problem: 'Style attribute on HTML elements',
    solution: 'Use CSS classes instead',
    estimatedSavings: '2-5%',
  },
  {
    name: 'Unused CSS Frameworks',
    problem: 'Loading entire CSS framework for few components',
    solution: 'Custom CSS or tree-shake framework',
    estimatedSavings: '30-60%',
  },
  {
    name: 'Vendor Prefixes',
    problem: 'Including prefixes for old browsers',
    solution: 'Use Autoprefixer only for targeted browsers',
    estimatedSavings: '3-8%',
  },
  {
    name: 'Non-Critical Media Queries',
    problem: 'Loading all media queries upfront',
    solution: 'Load media queries asynchronously',
    estimatedSavings: '5-10%',
  },
  {
    name: 'Large Icon Fonts',
    problem: 'Loading entire icon font',
    solution: 'Use only needed icons or inline SVGs',
    estimatedSavings: '10-20%',
  },
  {
    name: 'Unoptimized Source Order',
    problem: 'Specificity wars and overrides',
    solution: 'BEM or CSS modules for clarity',
    estimatedSavings: '5-15%',
  },
]

/**
 * CSS optimization techniques
 */
export const CSS_OPTIMIZATION_TECHNIQUES = {
  /**
   * 1. Tree-shaking with Tailwind CSS
   * Automatically removes unused utility classes
   */
  tailwindPurging: {
    description: 'Only include used Tailwind utilities',
    implementation: `
      // tailwind.config.js
      module.exports = {
        content: [
          './src/pages/**/*.{js,ts,jsx,tsx}',
          './src/components/**/*.{js,ts,jsx,tsx}',
        ],
        theme: { extend: {} },
      }
    `,
    estimatedReduction: '60-70%',
    impact: 'Critical',
  },

  /**
   * 2. Critical CSS inlining
   * Inline critical CSS in <head>
   */
  criticalCSS: {
    description: 'Inline styles needed for initial render',
    implementation: `
      // In next.config.js or _document.tsx
      // Extract and inline critical CSS
    `,
    estimatedReduction: '5-10%',
    impact: 'Performance (FCP improvement)',
  },

  /**
   * 3. CSS code splitting
   * Load CSS per route
   */
  codeSplitting: {
    description: 'Only load CSS for current route',
    implementation: `
      // Use Next.js CSS modules
      import styles from './Page.module.css'
    `,
    estimatedReduction: '40-50%',
    impact: 'High (DOMContentLoaded reduction)',
  },

  /**
   * 4. CSS minification
   * Remove whitespace and comments
   */
  minification: {
    description: 'Minify all CSS files',
    implementation: `
      // Built-in to Next.js and most bundlers
      // production: true enables minification
    `,
    estimatedReduction: '20-30%',
    impact: 'Medium (size reduction)',
  },

  /**
   * 5. Media query optimization
   * Load media queries asynchronously
   */
  mediaQueryOptimization: {
    description: 'Load print/high-dpi styles asynchronously',
    implementation: `
      <link rel="stylesheet" media="print" href="print.css">
      <link rel="stylesheet" media="(min-width: 1024px)" href="desktop.css">
    `,
    estimatedReduction: '10-20%',
    impact: 'Medium (blocking reduction)',
  },

  /**
   * 6. Unused CSS removal
   * Remove unused selectors
   */
  unusedCSSRemoval: {
    description: 'PurgeCSS or Tailwind purge',
    implementation: `
      // purgeCSS configuration
      content: ['./src/**/*.{js,jsx,ts,tsx}'],
    `,
    estimatedReduction: '30-50%',
    impact: 'High (size reduction)',
  },

  /**
   * 7. CSS variables for theming
   * Reduce CSS size for multiple themes
   */
  cssVariables: {
    description: 'Use CSS custom properties for themes',
    implementation: `
      :root {
        --color-primary: #3b82f6;
        --color-secondary: #10b981;
      }
      .button { color: var(--color-primary); }
    `,
    estimatedReduction: '15-30%',
    impact: 'Medium (maintainability + size)',
  },

  /**
   * 8. System font stack
   * Avoid loading custom fonts
   */
  systemFonts: {
    description: 'Use system fonts instead of web fonts',
    implementation: `
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
    `,
    estimatedReduction: '20-40%',
    impact: 'High (load time reduction)',
  },
}

/**
 * CSS file size by component
 */
export const CSS_BREAKDOWN = {
  // Expected size for each category
  core: {
    name: 'Core styles',
    description: 'Layout, typography, basic elements',
    target: '20KB',
    includes: ['reset', 'typography', 'layout'],
  },

  tailwind: {
    name: 'Tailwind utilities',
    description: 'Utility classes for responsive design',
    target: '80KB',
    includes: [
      'spacing',
      'sizing',
      'colors',
      'flexbox',
      'grid',
      'responsive',
    ],
  },

  components: {
    name: 'Component styles',
    description: 'Styled components, modules',
    target: '40KB',
    includes: ['buttons', 'cards', 'forms', 'modals'],
  },

  themes: {
    name: 'Theme styles',
    description: 'Dark mode, custom themes',
    target: '30KB',
    includes: ['dark-mode', 'custom-theme'],
  },

  animations: {
    name: 'Animations',
    description: 'Transitions and keyframes',
    target: '15KB',
    includes: ['transitions', 'animations', 'loading'],
  },

  print: {
    name: 'Print styles',
    description: 'Styles for printing',
    target: '5KB',
    includes: ['print-layout', 'print-colors'],
  },
}

/**
 * CSS optimization checklist
 */
export const CSS_OPTIMIZATION_CHECKLIST = [
  {
    step: 1,
    task: 'Audit CSS size',
    details: 'Measure current CSS file sizes',
    tools: ['webpack-bundle-analyzer', 'bundlesize'],
  },
  {
    step: 2,
    task: 'Setup Tailwind purging',
    details: 'Configure content paths in tailwind.config.js',
    impact: '60-70% reduction',
  },
  {
    step: 3,
    task: 'Remove unused CSS',
    details: 'PurgeCSS or manual cleanup',
    impact: '30-50% reduction',
  },
  {
    step: 4,
    task: 'Extract critical CSS',
    details: 'Inline critical styles in <head>',
    impact: 'FCP improvement',
  },
  {
    step: 5,
    task: 'CSS code splitting',
    details: 'Load CSS per route or feature',
    impact: '40-50% reduction',
  },
  {
    step: 6,
    task: 'Enable minification',
    details: 'Verify production minification',
    impact: '20-30% reduction',
  },
  {
    step: 7,
    task: 'Optimize font loading',
    details: 'Use system fonts or subset custom fonts',
    impact: '20-40% reduction',
  },
  {
    step: 8,
    task: 'Test and measure',
    details: 'Verify all targets met',
    tools: ['Lighthouse', 'PageSpeed Insights'],
  },
]

/**
 * Performance impact summary
 */
export const CSS_OPTIMIZATION_IMPACT = {
  // Before optimization
  before: {
    cssSize: 450,
    fcp: 1.8,
    dcl: 2.2,
    paint: 1.5,
  },

  // After optimization
  after: {
    cssSize: 150,
    fcp: 1.1,
    dcl: 1.4,
    paint: 0.9,
  },

  // Improvements
  improvements: {
    cssSize: '67% reduction',
    fcp: '39% improvement',
    dcl: '36% improvement',
    paint: '40% improvement',
  },
}

/**
 * CSS optimization tools and plugins
 */
export const CSS_OPTIMIZATION_TOOLS = [
  {
    name: 'Tailwind CSS',
    purpose: 'Utility-first CSS with built-in purging',
    integration: 'Direct in PostCSS',
    effectiveness: '70-80%',
  },
  {
    name: 'PurgeCSS',
    purpose: 'Remove unused CSS',
    integration: 'PostCSS plugin',
    effectiveness: '40-60%',
  },
  {
    name: 'cssnano',
    purpose: 'CSS minification and optimization',
    integration: 'PostCSS plugin',
    effectiveness: '20-30%',
  },
  {
    name: 'Autoprefixer',
    purpose: 'Add vendor prefixes',
    integration: 'PostCSS plugin',
    effectiveness: 'Browser compatibility',
  },
  {
    name: 'UnCSS',
    purpose: 'Remove unused CSS',
    integration: 'Standalone tool',
    effectiveness: '30-50%',
  },
  {
    name: 'Critical',
    purpose: 'Extract critical CSS',
    integration: 'Build tool',
    effectiveness: 'FCP improvement',
  },
]

/**
 * Next.js configuration for CSS optimization
 */
export const NEXT_CONFIG_CSS_OPTIMIZATION = `
// next.config.js
module.exports = {
  swcMinify: true, // Enable SWC minification

  // Optimize CSS
  reactStrictMode: true,

  // Webpack plugins for CSS optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side CSS optimizations
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          cacheGroups: {
            // Separate vendor CSS
            vendor: {
              test: /[\\\\/]node_modules[\\\\/]/,
              name: 'vendor',
              chunks: 'all',
            },
            // Separate critical CSS
            critical: {
              test: /critical\\.css$/,
              name: 'critical',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      }
    }
    return config
  },
}
`

/**
 * Tailwind configuration for optimization
 */
export const TAILWIND_OPTIMIZATION_CONFIG = `
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      // Extend only what's needed
      colors: {
        // Custom colors
      },
    },
  },

  // Only include needed plugins
  plugins: [],

  // Optimize output
  mode: 'jit',
  experimental: {
    optimizeUniversalDefaults: true,
  },
}
`
