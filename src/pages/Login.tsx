import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, KeyRound } from 'lucide-react';
import { useDrivers } from '@/contexts/DriversContextSupabase';
import { PasswordChangeDialog } from '@/components/PasswordChangeDialog';
import { SupabaseService } from '@/services/supabaseService';

function Login() {
  const navigate = useNavigate();
  const { validateCredentials } = useDrivers();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loggedInDriver, setLoggedInDriver] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Login attempt with email:', email);
      
      // First, check against database admin users
      try {
        const adminUser = await SupabaseService.adminUsers.getUserByEmail(email);
        if (adminUser && adminUser.isActive) {
          // Simple password check - in production, use proper hashing
          const passwordMatches = 
            adminUser.passwordHash === `hashed_${password}` || 
            // Legacy hardcoded credentials for backward compatibility
            (email === 'admin@hhdonations.org' && password === 'admin123') ||
            (email === 'carmine@zayoungroup.com' && password === 'hh123!');
          
          if (passwordMatches) {
            console.log('Admin credentials matched, updating last login...');
            
            // Update last login timestamp
            await SupabaseService.adminUsers.updateAdminUser(adminUser.id, {
              lastLogin: new Date().toISOString()
            });
            
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('adminAuth', 'true'); // Keep for backward compatibility
            console.log('Navigating to /admin/bins...');
            navigate('/admin/bins');
            return;
          }
        }
      } catch (adminError) {
        console.error('Error checking admin user:', adminError);
        // Continue to check driver credentials if admin check fails
      }
      
      // Check for driver credentials using Supabase
      const authResult = await validateCredentials(email, password);
      
      if (authResult) {
        const { driver, isFirstTime } = authResult;
        
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'driver');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('driverId', driver.id);
        
        if (isFirstTime) {
          // Show password change dialog for first-time login
          setLoggedInDriver(driver);
          setShowPasswordChange(true);
          return;
        }
        
        // Navigate to driver dashboard
        navigate('/driver/bin-routes');
        return;
      }
      
      // Invalid credentials
      setError('Invalid email or password');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChangeComplete = () => {
    setShowPasswordChange(false);
    setLoggedInDriver(null);
    // Navigate to driver dashboard after successful password change
    navigate('/driver/bin-routes');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 px-4 overflow-hidden">
      <Card className="w-full max-w-md my-auto">
        <CardHeader className="space-y-1 pb-3">
          <div className="flex items-center justify-center mb-1">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center text-sm">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3 py-3">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </div>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Password Change Dialog for First-Time Login */}
      {loggedInDriver && (
        <PasswordChangeDialog
          isOpen={showPasswordChange}
          onClose={handlePasswordChangeComplete}
          driverId={loggedInDriver.id}
          isFirstTime={true}
        />
      )}
    </div>
  );
}

export default Login;