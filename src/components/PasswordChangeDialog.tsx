import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useDrivers } from '@/contexts/DriversContextSupabase';

interface PasswordChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  driverId: string;
  isFirstTime?: boolean;
}

export const PasswordChangeDialog: React.FC<PasswordChangeDialogProps> = ({
  isOpen,
  onClose,
  driverId,
  isFirstTime = false
}) => {
  const { changePassword } = useDrivers();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await changePassword(driverId, newPassword);
      setSuccess('Password changed successfully!');
      
      // Close dialog after success
      setTimeout(() => {
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Password change error:', err);
      setError('Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isFirstTime) {
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isFirstTime ? undefined : handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isFirstTime ? 'Change Your Temporary Password' : 'Change Password'}
          </DialogTitle>
          <DialogDescription>
            {isFirstTime 
              ? 'For security, you must change your temporary password before continuing.'
              : 'Enter your current password and choose a new one.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {!isFirstTime && (
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <p className="text-sm text-gray-600">
              Password must be at least 8 characters with uppercase, lowercase, and number.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            {!isFirstTime && (
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};