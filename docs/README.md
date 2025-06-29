# SiteSeeker GitHub Pages

This folder contains the GitHub Pages website for the SiteSeeker project.

## Structure

- `index.html` - Main landing page
- `styles.css` - CSS styles and responsive design
- `script.js` - JavaScript functionality and interactions
- `assets/` - Images and media files
- `_config.yml` - GitHub Pages configuration
- `sitemap.xml` - SEO sitemap
- `robots.txt` - Search engine directives
- `_headers` - Security headers

## Build Process

GitHub Pages automatically uses the `docs` folder. No build process is required - it's a static website.

## Required Files

All necessary image files should be in the `assets/` folder:

- `favicon.png` - Site favicon
- `install-step.png` - Screenshot showing installation process
- `search-step.png` - Screenshot showing search interface
- `advanced-step.png` - Screenshot showing advanced features
- `developer-avatar.png` - Developer profile image

## Deployment

The GitHub Actions workflow (`deploy.yml`) automatically:

1. Triggers when changes are pushed to the `main` branch
2. Detects changes in the `docs/` folder
3. Deploys to GitHub Pages

## Local Development

To test locally:

```bash
cd docs
python3 -m http.server 8080
```

Then visit `http://localhost:8080`

Alternative using Node.js:
```bash
cd docs
npx serve .
```

## Features

### SEO Optimized
- Meta tags for search engines
- Open Graph tags for social media
- Structured data for rich snippets
- Sitemap and robots.txt

### Performance
- Optimized images
- Minified CSS and JS
- Lazy loading
- Critical resource preloading

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- High contrast support

### Security
- Content Security Policy
- Security headers
- HTTPS enforcement
- XSS protection

## Contributing

When making changes to the website:

1. Test locally first
2. Ensure all images are optimized
3. Check accessibility compliance
4. Validate HTML and CSS
5. Test on multiple devices
6. Update documentation if needed

## File Descriptions

### HTML Structure
- Semantic HTML5 elements
- ARIA labels for accessibility
- Responsive meta tags
- Progressive enhancement

### CSS Features
- CSS Grid and Flexbox
- CSS Custom Properties
- Dark mode support
- Mobile-first responsive design

### JavaScript Features
- Intersection Observer for animations
- Lazy loading implementation
- Accessibility enhancements
- Performance optimizations
