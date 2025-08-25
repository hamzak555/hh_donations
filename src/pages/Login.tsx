import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { useDrivers } from '@/contexts/DriversContextSupabase';
import { PasswordChangeDialog } from '@/components/PasswordChangeDialog';

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
      // Check for admin credentials (hardcoded for demo)
      if (email === 'admin@hhdonations.org' && password === 'admin123') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userEmail', email);
        navigate('/admin/bins');
        return;
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
      setError('Invalid email or password. Please try again.');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
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
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="text-sm text-center text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="text-primary hover:underline">
                Sign up
              </a>
            </div>
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