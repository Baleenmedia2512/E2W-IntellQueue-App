# IntellQueue Development Setup Guide

## Project Overview
IntellQueue is a Next.js Progressive Web App (PWA) with Capacitor integration for mobile deployment. It's a queue management system built with React, NextUI, Material-UI, and Firebase.

## Prerequisites ✅
- **Node.js**: v20.11.1 (installed)
- **npm**: v10.2.4 (installed) 
- **Java**: OpenJDK 17.0.16 (installed)
- **Android Studio**: Required for mobile development

## Development Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Development Commands

#### Web Development
```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

#### Mobile Development (Android)
```bash
# Build web app and sync with Android
npm run android:build

# Build, sync, and run on Android device/emulator
npm run android:dev

# Open Android project in Android Studio
npm run android:open

# Sync changes without building
npx cap sync android
```

#### Capacitor Commands
```bash
# Sync all platforms
npm run capacitor:sync

# Add new platform
npm run capacitor:add

# Check environment status
npx cap doctor android
```

## Project Structure
```
📦 IntellQueue App
├── 🌐 app/                    # Next.js App Router pages
├── 📱 android/                # Capacitor Android project
├── 🔧 api/                    # Backend API files
├── ⚙️ hooks/                  # React custom hooks
├── 🎨 public/                 # Static assets & PWA files
├── 🔄 redux/                  # Redux store configuration
├── 📜 scripts/                # Build scripts
└── 👷 worker/                 # Service worker files
```

## Key Technologies
- **Frontend**: Next.js 14, React 18, NextUI, Material-UI
- **Mobile**: Capacitor 7.x
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS, PrimeReact
- **PWA**: next-pwa, Workbox
- **Backend**: Firebase, PHP API

## Development Workflow

### For Web Development:
1. Run `npm run dev` to start development server
2. Access app at `http://localhost:3000`
3. Make changes to files in `/app` directory
4. Hot reload will update automatically

### For Mobile Development:
1. Build web app: `npm run build`
2. Sync with mobile: `npx cap sync android`
3. Open in Android Studio: `npm run android:open`
4. Run on device/emulator from Android Studio

### For Full Mobile Development Cycle:
```bash
npm run android:dev
```
This command builds, syncs, and launches the app on Android automatically.

## Environment Status ✅
- ✅ Node.js v20.11.1 installed
- ✅ npm v10.2.4 installed  
- ✅ Dependencies installed (1,671 packages)
- ✅ Java 17 configured
- ✅ Next.js development server working
- ✅ Build system functional
- ✅ Capacitor Android sync successful
- ✅ PWA service worker configured

## Available Scripts in package.json
- `dev`: Start development server
- `build`: Build production version
- `start`: Start production server
- `lint`: Run ESLint
- `android:build`: Build and sync Android
- `android:dev`: Full Android development cycle
- `android:open`: Open Android Studio

## Notes
- The app includes PWA capabilities with offline support
- Firebase is configured for authentication and real-time features
- The project uses static export for better Capacitor compatibility
- Hot reload works for web development
- Mobile changes require rebuild and sync

## Getting Started
1. Open terminal in project directory
2. Run `npm run dev` for web development
3. Access `http://localhost:3000` in your browser
4. For mobile testing, use `npm run android:dev`

Ready for development! 🚀