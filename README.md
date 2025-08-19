# HH Donations Management System

A comprehensive web application for managing clothing donations, bins, pickups, and container shipments. Built with React, TypeScript, and Supabase.

## 🌟 Features

### Public Features
- **Find Donation Bins**: Interactive map to locate nearby donation bins
- **Request Pickup**: Schedule donation pickups for large items
- **Partner Applications**: Apply to become a donation partner
- **Information Pages**: Learn about what to donate, our story, and partnerships
- **FAQ Section**: Common questions and answers
- **Contact Form**: Get in touch with the organization

### Admin Dashboard
- **Bin Management**: Track and manage donation bin locations with sensor integration
- **Container Management**: Organize shipping containers and track bales
- **Bale Management**: Create and track compressed clothing bales
- **Driver Management**: Manage drivers and their routes
- **Pickup Requests**: Handle and route pickup requests
- **Route Optimization**: Generate optimized pickup routes using Google Maps
- **User Management**: Admin user access control
- **Partner Applications**: Review and manage partnership applications
- **Sensor Integration**: Real-time bin fill level monitoring (Sensoneo)
- **Data Recovery**: Restore deleted data when needed

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Maps**: Google Maps API
- **Routing**: React Router v6
- **State Management**: React Context API with localStorage fallback
- **Deployment**: Vercel
- **Build Tool**: Create React App with react-app-rewired

## 📋 Prerequisites

- Node.js 16+ and npm
- Supabase account and project
- Google Maps API key
- Sensoneo API key (optional, for sensor integration)

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps API
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Sensoneo API (Optional - for sensor integration)
REACT_APP_SENSONEO_API_KEY=your_sensoneo_api_key
```

## 💻 Installation

1. Clone the repository:
```bash
git clone https://github.com/hamzak555/hh_donations.git
cd hh_donations
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables (see above)

4. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📦 Available Scripts

- `npm start` - Run development server on port 3000
- `npm run build` - Create production build
- `npm test` - Run test suite
- `npm run lint` - Lint code (if configured)
- `npm run typecheck` - Check TypeScript types (if configured)

## 🗄️ Database Setup

The application uses Supabase for data persistence. Required tables:

- `bins` - Donation bin locations and status
- `containers` - Shipping containers
- `bales` - Compressed clothing bales
- `drivers` - Driver information
- `pickup_requests` - Pickup request records
- `admin_users` - Admin user accounts
- `partner_applications` - Partnership applications

Database schema is available in `database/schema.sql`

## 🚢 Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy (Vercel will auto-deploy on push to main)

The `vercel.json` configuration handles:
- Build settings with legacy peer deps
- Routing rewrites for SPA
- Security headers for admin routes
- CI=false to allow warnings during build

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn)
│   ├── AdminLayout.tsx # Admin dashboard layout
│   ├── AdminSidebar.tsx# Admin navigation
│   └── ...             # Other components
├── contexts/           # React Context providers
│   ├── BinsContextSupabase.tsx
│   ├── ContainersContextSupabase.tsx
│   ├── BalesContextSupabase.tsx
│   ├── DriversContextSupabase.tsx
│   ├── PickupRequestsContextSupabase.tsx
│   └── PartnerApplicationsContext.tsx
├── pages/              # Page components
│   ├── admin/          # Admin dashboard pages
│   │   ├── BinsManagement.tsx
│   │   ├── ContainerManagement.tsx
│   │   ├── BaleManagement.tsx
│   │   ├── DriversManagement.tsx
│   │   ├── PickupRequests.tsx
│   │   ├── UserManagement.tsx
│   │   └── ...
│   └── ...             # Public pages
├── services/           # API and external services
│   ├── supabaseService.ts
│   ├── sensoneoApi.ts
│   └── authService.ts
├── utils/              # Utility functions
│   ├── safeStorage.ts  # localStorage wrapper
│   ├── storageManager.ts
│   └── networkHandler.ts
└── lib/                # Library configurations
    └── supabase.ts     # Supabase client setup
```

## 🔑 Key Features Implementation

### Data Persistence Strategy
- **Primary**: Supabase (PostgreSQL) for cloud storage
- **Fallback**: Browser localStorage for offline capability
- **Sync**: Automatic sync between local and remote storage
- **Conflict Resolution**: Timestamp-based conflict resolution

### Network Resilience
- Retry queue for failed API operations
- Automatic reconnection attempts
- Graceful degradation to offline mode
- Network status monitoring

### Security Features
- Admin route protection
- Security headers on sensitive routes
- Input validation and sanitization
- No-index headers for admin pages
- CSRF protection

### Performance Optimizations
- Lazy loading for routes
- Optimized bundle size with code splitting
- Efficient re-renders with React.memo
- Debounced search inputs
- Cached API responses

## 🛠️ Development Guidelines

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Context API for state management
- Tailwind CSS for styling
- Component-based architecture

### Best Practices
- Follow React best practices
- Use TypeScript strict mode
- Write meaningful commit messages
- Test components before deployment
- Document complex logic

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues and questions:
- Open an issue in the GitHub repository
- Contact the development team
- Check the FAQ section in the app

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Database powered by [Supabase](https://supabase.com)
- Maps integration via [Google Maps API](https://developers.google.com/maps)
- Deployed on [Vercel](https://vercel.com)
- Sensor integration with [Sensoneo](https://sensoneo.com)

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: Production Ready