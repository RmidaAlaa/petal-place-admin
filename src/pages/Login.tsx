import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthModal } from '@/components/AuthModal';
import { LogIn, Mail, Lock, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, state: authState } = useAuth();
  const { t } = useLanguage();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // If already authenticated, redirect to intended destination
  if (authState.isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your Roses Garden account
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            <Alert>
              <AlertDescription>
                This is a demo application. Click the button below to use the authentication modal.
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => setShowAuthModal(true)}
              className="w-full"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In with Modal
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate('/')}
                className="text-sm text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Demo Information</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use the authentication modal for login</li>
              <li>• Admin access requires admin role</li>
              <li>• All features are fully functional</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Login;