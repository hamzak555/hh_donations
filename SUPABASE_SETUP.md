# Supabase Setup Guide for H&H Donations

This guide will help you set up Supabase for the H&H Donations application to replace localStorage with a proper database.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Access to your Supabase project dashboard

## Step 1: Create a Supabase Project

1. Log in to your Supabase dashboard
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `hh-donations` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

## Step 3: Configure Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
# Replace these with your actual Supabase credentials
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `/database/schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" to execute the SQL
6. Verify that the tables were created by going to **Table Editor**

You should see the following tables:
- `bins`
- `drivers`
- `containers`
- `bales`
- `pickup_requests`

## Step 5: Migrate Existing Data (Optional)

If you have existing data in localStorage that you want to migrate to Supabase:

1. Open your browser's developer console (F12)
2. Navigate to your H&H Donations app
3. Run the following commands in the console:

```javascript
// Import the migration utility
import { DataMigration } from './src/utils/dataMigration';

// Test Supabase connection
await DataMigration.testSupabaseConnection();

// Create a backup of your current data (recommended)
const backup = DataMigration.createLocalStorageBackup();
console.log('Backup created:', backup);

// Migrate all data to Supabase
await DataMigration.migrateAllData();
```

## Step 6: Enable Supabase Mode

Once your credentials are set up and tables are created:

1. Restart your development server (`npm start`)
2. The app will automatically detect your Supabase configuration
3. You should see console messages indicating "Using Supabase for data persistence"

## Step 7: Verify Everything Works

1. Test creating a new bin, driver, or pickup request
2. Check your Supabase dashboard's **Table Editor** to see the data
3. Refresh the page to ensure data persists

## Row Level Security (RLS)

The schema includes basic RLS policies that allow all operations. For production use, you should:

1. Set up proper authentication
2. Create more restrictive RLS policies
3. Consider role-based access control

## Troubleshooting

### Error: "Invalid API key"
- Double-check your `REACT_APP_SUPABASE_ANON_KEY` in the `.env` file
- Make sure you copied the "anon public" key, not the service role key

### Error: "Failed to fetch"
- Verify your `REACT_APP_SUPABASE_URL` is correct
- Check if your Supabase project is active and not paused

### Tables not found
- Ensure you ran the complete `schema.sql` file
- Check the **Table Editor** in Supabase dashboard to verify tables exist

### Migration issues
- Check browser console for detailed error messages
- Verify your localStorage contains data before migrating
- Try migrating one entity type at a time

## Data Model

The Supabase implementation mirrors your existing localStorage structure:

- **bins**: Donation bin locations with sensor data
- **drivers**: Driver information and assigned bins
- **containers**: Container tracking and status
- **bales**: Processed donation bales
- **pickup_requests**: Customer pickup requests

## Performance Considerations

- Supabase automatically indexes primary keys and foreign keys
- Additional indexes are created for frequently queried fields
- Real-time subscriptions can be added for live updates
- Consider implementing pagination for large datasets

## Security Best Practices

1. **Never expose your service role key** in client-side code
2. Use **RLS policies** to restrict data access
3. Implement **authentication** for admin features
4. Consider **API rate limiting** for public endpoints
5. Regularly **backup your database**

## Next Steps

After successful setup:

1. Remove localStorage fallbacks once you're confident in Supabase
2. Implement real-time updates using Supabase subscriptions
3. Add user authentication for admin features
4. Set up automated backups
5. Configure production environment variables

## Support

If you encounter issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the browser console for error messages
3. Verify your environment variables are correctly set
4. Test the connection using the migration utility