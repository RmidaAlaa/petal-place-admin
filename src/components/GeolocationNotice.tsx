import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MapPin, X, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { toast } from 'sonner';

const GeolocationNotice: React.FC = () => {
  const { state: authState } = useAuth();
  const [showNotice, setShowNotice] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationUpdated, setLocationUpdated] = useState(false);

  useEffect(() => {
    // Only show for authenticated users who haven't set location yet
    if (authState.isAuthenticated && authState.user) {
      checkUserLocation();
    }
  }, [authState.isAuthenticated, authState.user]);

  const checkUserLocation = async () => {
    try {
      const location = await apiService.getUserLocation();
      // If user has location, don't show notice
      if (location) {
        setShowNotice(false);
      } else {
        setShowNotice(true);
      }
    } catch (error) {
      // User doesn't have location set, show notice
      setShowNotice(true);
    }
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get city name
          let city = 'Unknown';
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            city = data.city || data.locality || 'Unknown';
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
          }

          // Update user location
          await apiService.updateUserLocation({
            latitude,
            longitude,
            city,
            country: 'Saudi Arabia',
          });

          setLocationUpdated(true);
          setShowNotice(false);
          
          toast.success(`📍 Location updated: ${city}`);
          
          // Hide notice after 3 seconds
          setTimeout(() => {
            setLocationUpdated(false);
          }, 3000);
        } catch (error: any) {
          toast.error('Failed to update location: ' + error.message);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location permissions.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information unavailable.');
            break;
          case error.TIMEOUT:
            toast.error('Location request timed out.');
            break;
          default:
            toast.error('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleDismiss = () => {
    setShowNotice(false);
  };

  if (!authState.isAuthenticated || !showNotice) {
    return null;
  }

  if (locationUpdated) {
    return (
      <Alert className="border-green-200 bg-green-50 text-green-800">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Location updated successfully! We can now provide you with better local recommendations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-blue-200 bg-blue-50 text-blue-800">
      <MapPin className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span>
          Help us provide better service by sharing your location for local recommendations and delivery options.
        </span>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={handleGetLocation}
            disabled={isLocating}
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            {isLocating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700 mr-2"></div>
                Locating...
              </>
            ) : (
              'Share Location'
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-blue-700 hover:bg-blue-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default GeolocationNotice;
