# IMS Community Events

A React + TypeScript application for displaying and managing community events. Features event listings with status tracking (upcoming, past, archived), meeting links, and recording availability.

## Overview

This project provides a clean interface to browse community events with details including:
- Event title, description, and date
- Event status (upcoming, past, or archived)
- Meeting links for live events
- Recording links for past events
- Categorization via tags

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast build and HMR
- **Material-UI (MUI)** for component styling
- **ESLint** for code quality

## Getting Started

### Prerequisites
- Node.js (v20+)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the development server at `http://localhost:5173`

### Build

```bash
npm run build
```

Builds the application for production in the `dist/` folder.

## Project Structure

- `src/components/` - React components (EventList, EventCard)
- `src/data/` - Event data files
- `src/types/` - TypeScript interfaces
- `src/utils/` - Helper utilities (event status, etc.)

## License

MIT
