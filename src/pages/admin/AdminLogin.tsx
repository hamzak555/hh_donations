import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, User } from 'lucide-react';
import NoIndexSEO from '@/components/NoIndexSEO';
import { SupabaseService } from '@/services/supabaseService';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check against database admin users
      const adminUser = await SupabaseService.adminUsers.getUserByEmail(username);
      
      if (adminUser && adminUser.isActive) {
        // Simple password check - in production, use proper hashing
        const passwordMatches = 
          adminUser.passwordHash === `hashed_${password}` || 
          // Legacy hardcoded credentials for backward compatibility
          (username === 'admin' && password === 'admin123') ||
          (username === 'admin@hhdonations.org' && password === 'admin123') ||
          (username === 'carmine@zayoungroup.com' && password === 'hh123!');
        
        if (passwordMatches) {
          // Update last login timestamp
          await SupabaseService.adminUsers.updateAdminUser(adminUser.id, {
            lastLogin: new Date().toISOString()
          });
          
          // Store auth state (in production, use proper auth tokens)
          localStorage.setItem('adminAuth', 'true');
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userEmail', adminUser.email);
          navigate('/admin/bins');
          return;
        }
      }
      
      // Also check the legacy hardcoded admin account
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('adminAuth', 'true');
        navigate('/admin/bins');
        return;
      }
      
      setError('Invalid username or password');
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <>
      <NoIndexSEO title="Admin Login" />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white">
              <Lock className="w-6 h-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
            <p className="text-xs text-gray-500 text-center mt-4">
              Demo credentials: admin / admin123
            </p>
          </CardContent>
        </form>
      </Card>
      </div>
    </>
  );
}

export default AdminLogin;