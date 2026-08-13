# Global Travellers App

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-active-brightgreen)](https://tech-v6.github.io/Global-Travillers-app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Language: German](https://img.shields.io/badge/Language-German-red)](https://en.wikipedia.org/wiki/German_language)

## Overview

**Global Travellers** is a comprehensive transit information platform providing live open data access for Germany's major central train stations. The app aggregates real-time departure information, platform details, and complete station services to enhance your travel experience.

## Features

🚂 **Live Transit Data**
- Real-time departures and arrivals
- Platform information and changes
- Service updates and alerts
- Integration with multiple data sources

📍 **25+ Central Station Guides**
- Berlin Hauptbahnhof (Berlin Hbf)
- München Hauptbahnhof (Munich Hbf)
- Nürnberg Hauptbahnhof (Nuremberg Hbf)
- Hamburg Hauptbahnhof (Hamburg Hbf)
- Köln Hauptbahnhof (Cologne Hbf)
- Frankfurt Hauptbahnhof (Frankfurt Hbf)
- Stuttgart Hauptbahnhof (Stuttgart Hbf)
- And many more...

🗺️ **Complete Station Information**
- Service points and facilities
- Restroom locations
- Information desks
- Platform layouts
- Accessibility information

🌍 **Global Data Integration**
- Transitous (European Transit Data)
- DELFI (German Federal Transit Network)
- GTFS Feeds (General Transit Feed Specification)
- GTFS-RT (Real-Time Updates)

## Data Sources

We leverage multiple open data sources to provide accurate, up-to-date transit information:

- **Transitous**: European transit data aggregator
- **DELFI**: German integrated mobility data platform
- **GTFS**: Universal transit data format
- **GTFS-RT**: Real-time transit updates

## Getting Started

### Visit the App

🌐 **Live Demo**: [Global Travellers App](https://tech-v6.github.io/Global-Travillers-app/)

### For Developers

This project is built with:
- **HTML5** - Semantic markup
- **CSS3** - Modern styling and responsive design
- **JavaScript** - Dynamic functionality (coming soon)
- **GitHub Pages** - Hosting and CI/CD

### Project Structure

```
Global-Travillers-app/
├── index.html          # Main landing page
├── sitemap.xml         # SEO sitemap
├── robots.txt          # Search engine crawling rules
├── _config.yml         # GitHub Pages configuration
├── README.md           # This file
└── /assets/            # Images, fonts, and other assets
```

## SEO & Discoverability

This project is optimized for search engines:

✅ **Search Console Verified**: Submitted and approved with Google Search Console  
✅ **Structured Data**: JSON-LD schema for rich snippets  
✅ **Sitemap**: Comprehensive XML sitemap for easy crawling  
✅ **Robots.txt**: Clear crawling guidelines  
✅ **Meta Tags**: Optimized titles, descriptions, and keywords  
✅ **Open Graph**: Social media sharing optimization  
✅ **Mobile Responsive**: 100% mobile-friendly design  
✅ **Core Web Vitals**: Optimized for performance metrics  

## Next Steps

### Coming Soon

- 📱 **Mobile App Releases**
  - Google Play Store
  - Apple App Store
  - Direct APK downloads

- 🌐 **Web Platform Features**
  - Interactive station maps
  - Trip planning
  - Saved favorites
  - Notification system

- 🔌 **API Access**
  - Public API for developers
  - Real-time data endpoints
  - Integration documentation

## Installation & Setup

### For Local Development

```bash
# Clone the repository
git clone https://github.com/Tech-v6/Global-Travillers-app.git

# Navigate to the directory
cd Global-Travillers-app

# Open in your browser
open index.html
```

### For GitHub Pages

The site is automatically deployed via GitHub Pages. Any changes to the `main` branch will be live within minutes.

### Android AAB Build Workflow

This repository now includes a GitHub Actions workflow at `.github/workflows/build-signed-aab.yml` for generating a signed release AAB that you can upload directly to Google Play Console.

Before running it, add these GitHub repository secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

After the workflow finishes, download the `signed-release-aab` artifact from the workflow run summary or artifacts list.

## Configuration

### Update Google Search Console Token

In `index.html`, replace:
```html
<meta name="google-site-verification" content="REPLACE_WITH_GOOGLE_VERIFICATION_TOKEN" />
```

With your actual token from Google Search Console.

### Submit to Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your domain property
3. Submit the `sitemap.xml` file
4. Monitor crawl errors and performance metrics

## Performance Optimization

- **CSS**: Minified and optimized
- **Images**: Responsive and optimized
- **Fonts**: System fonts for fast loading
- **Core Web Vitals**: Optimized LCP, FID, and CLS

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact & Support

- **GitHub**: [Tech-v6](https://github.com/Tech-v6)
- **Issues**: [Report a bug](https://github.com/Tech-v6/Global-Travillers-app/issues)
- **Email**: cusmasobi888@gmail.com

## Contributing

Contributions are welcome! Please feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [Transitous](https://transitous.org/) - European transit data
- [DELFI](https://www.delfi.de/) - German mobility data
- [GTFS](https://gtfs.org/) - Transit data specification
- [GitHub Pages](https://pages.github.com/) - Hosting

## Roadmap

- [ ] Mobile app launch (Android)
- [ ] Mobile app launch (iOS)
- [ ] Interactive station maps
- [ ] Trip planning features
- [ ] User accounts and saved preferences
- [ ] Notification system
- [ ] Multi-language support
- [ ] API for third-party developers
- [ ] Offline mode
- [ ] Dark/Light theme toggle

## Privacy & Terms

- [Privacy Policy](https://tech-v6.github.io/Global-Travillers-app/privacy)
- [Terms of Service](https://tech-v6.github.io/Global-Travillers-app/terms)

---

**Last Updated**: August 10, 2026  
**Status**: Active Development  
**Maintainer**: Tech-v6