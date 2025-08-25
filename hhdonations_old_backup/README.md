# HH Donations Management System

A comprehensive web application for managing clothing donation bins, pickup requests, drivers, containers, and bales.

## Features

- **Bin Management**: Track donation bin locations, status, and pickup schedules
- **Pickup Request System**: Allow users to request pickups with integrated Google Maps
- **Driver Management**: Manage driver assignments and routes
- **Container & Bale Tracking**: Track containers and bales from collection to shipment
- **Route Optimization**: Generate optimized pickup routes for drivers
- **Real-time Data Persistence**: All data stored locally with automatic saving

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Maps**: Google Maps API integration
- **State Management**: React Context API
- **Data Storage**: LocalStorage with automatic persistence
- **Build Tool**: Create React App with react-app-rewired

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Google Maps API key (for map features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hhdonations.git
cd hhdonations
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your Google Maps API key:
```
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```
The app will open at http://localhost:3000

### Production Build

To create an optimized production build:
```bash
npm run build
```

To serve the production build locally:
```bash
npx serve -s build -p 3000
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   └── ...            # Layout and navigation components
├── contexts/          # React Context providers for state management
├── pages/             # Page components
│   ├── admin/         # Admin dashboard pages
│   └── ...            # Public pages
├── utils/             # Utility functions
└── App.tsx            # Main application component
```

## Key Features

### Admin Dashboard
- **Bins Management**: Add, edit, delete donation bins
- **Drivers Management**: Manage driver profiles and assignments
- **Pickup Requests**: View and manage pickup requests
- **Route Generator**: Create optimized routes for drivers
- **Containers**: Track container status and contents
- **Bales**: Manage bale creation and assignment

### Public Pages
- **Find a Bin**: Locate nearest donation bins on a map
- **Request Pickup**: Submit pickup requests for large donations
- **Contact**: Get in touch with the organization

## Data Persistence

All data is automatically saved to browser localStorage. Data persists across:
- Page refreshes
- Server restarts
- Browser sessions

**Note**: Data is stored per browser and domain. Clearing browser data will remove stored information.

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For support, please contact the development team.