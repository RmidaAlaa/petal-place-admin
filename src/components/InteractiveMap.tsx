import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Phone, Clock, Star, Plus, Trash2, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Location {
  id: string;
  name: string;
  type: 'store' | 'gallery' | 'warehouse' | 'office';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  hours?: string;
  rating?: number;
  description?: string;
  isActive: boolean;
}

interface InteractiveMapProps {
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    type: 'store',
    isActive: true
  });
  const { state: authState } = useAuth();

  // Default locations data
  const defaultLocations: Location[] = [
    {
      id: '1',
      name: 'Roses Garden Main Store',
      type: 'store',
      address: '123 King Fahd Road, Riyadh, Saudi Arabia',
      coordinates: { lat: 24.7136, lng: 46.6753 },
      phone: '+966 50 123 4567',
      hours: 'Mon-Fri: 9:00 AM - 10:00 PM',
      rating: 4.8,
      description: 'Our flagship store featuring the complete collection of fresh flowers.',
      isActive: true
    },
    {
      id: '2',
      name: 'Riyadh Gallery',
      type: 'gallery',
      address: '456 Al Olaya District, Riyadh, Saudi Arabia',
      coordinates: { lat: 24.6877, lng: 46.6853 },
      phone: '+966 50 234 5678',
      hours: 'Mon-Sun: 10:00 AM - 9:00 PM',
      rating: 4.9,
      description: 'Premium gallery showcasing luxury floral arrangements.',
      isActive: true
    },
    {
      id: '3',
      name: 'Jeddah Branch',
      type: 'store',
      address: '789 Corniche Road, Jeddah, Saudi Arabia',
      coordinates: { lat: 21.4858, lng: 39.1925 },
      phone: '+966 50 345 6789',
      hours: 'Mon-Sun: 9:00 AM - 11:00 PM',
      rating: 4.7,
      description: 'Full-service store with delivery center.',
      isActive: true
    },
    {
      id: '4',
      name: 'Dammam Gallery',
      type: 'gallery',
      address: '321 King Fahd Road, Dammam, Saudi Arabia',
      coordinates: { lat: 26.4207, lng: 50.0888 },
      phone: '+966 50 456 7890',
      hours: 'Mon-Sat: 10:00 AM - 10:00 PM',
      rating: 4.6,
      description: 'Specialized gallery for premium flower collections.',
      isActive: true
    },
    {
      id: '5',
      name: 'Central Warehouse',
      type: 'warehouse',
      address: 'Industrial Area, Riyadh, Saudi Arabia',
      coordinates: { lat: 24.6322, lng: 46.7167 },
      phone: '+966 50 567 8901',
      hours: 'Mon-Fri: 6:00 AM - 6:00 PM',
      rating: 4.9,
      description: 'Main distribution center for fresh flower delivery.',
      isActive: true
    },
  ];

  useEffect(() => {
    const savedLocations = localStorage.getItem('roses-garden-locations');
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    } else {
      setLocations(defaultLocations);
      localStorage.setItem('roses-garden-locations', JSON.stringify(defaultLocations));
    }

    // Try to get saved token
    const savedToken = localStorage.getItem('mapbox-token');
    if (savedToken) {
      setMapboxToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [45.0792, 23.8859], // Center on Saudi Arabia
        zoom: 5,
        pitch: 30,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      map.current.on('load', () => {
        setMapLoaded(true);
        addMarkers();
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        toast.error('Failed to load map. Please check your Mapbox token.');
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      toast.error('Failed to initialize map');
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (mapLoaded) {
      addMarkers();
    }
  }, [locations, mapLoaded]);

  const addMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (!map.current) return;

    locations.filter(loc => loc.isActive).forEach((location) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: hsl(var(--primary));
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      `;
      el.innerHTML = getLocationTypeIcon(location.type);
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });
      el.addEventListener('click', () => {
        setSelectedLocation(location);
        map.current?.flyTo({
          center: [location.coordinates.lng, location.coordinates.lat],
          zoom: 12,
          duration: 1500,
        });
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.coordinates.lng, location.coordinates.lat])
        .addTo(map.current!);
      
      markersRef.current.push(marker);
    });
  };

  const saveLocations = (newLocations: Location[]) => {
    setLocations(newLocations);
    localStorage.setItem('roses-garden-locations', JSON.stringify(newLocations));
  };

  const handleSaveToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox-token', mapboxToken);
      setShowTokenInput(false);
      toast.success('Mapbox token saved! Reloading map...');
      // Force re-render
      window.location.reload();
    }
  };

  const openInMaps = (location: Location) => {
    const { lat, lng } = location.coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const getLocationTypeIcon = (type: Location['type']) => {
    const icons: Record<Location['type'], string> = {
      store: '🏪',
      gallery: '🎨',
      warehouse: '🏭',
      office: '🏢',
    };
    return icons[type] || '📍';
  };

  const getLocationTypeColor = (type: Location['type']) => {
    switch (type) {
      case 'store': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'gallery': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'warehouse': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'office': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const addLocation = () => {
    if (newLocation.name && newLocation.address && newLocation.coordinates) {
      const location: Location = {
        id: Date.now().toString(),
        name: newLocation.name,
        type: newLocation.type || 'store',
        address: newLocation.address,
        coordinates: newLocation.coordinates,
        phone: newLocation.phone,
        hours: newLocation.hours,
        rating: newLocation.rating,
        description: newLocation.description,
        isActive: newLocation.isActive || true
      };

      const updatedLocations = [...locations, location];
      saveLocations(updatedLocations);
      setNewLocation({ type: 'store', isActive: true });
      toast.success('Location added successfully!');
    }
  };

  const removeLocation = (id: string) => {
    const updatedLocations = locations.filter(loc => loc.id !== id);
    saveLocations(updatedLocations);
    if (selectedLocation?.id === id) {
      setSelectedLocation(null);
    }
    toast.success('Location removed');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Our Locations
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTokenInput(!showTokenInput)}
            >
              <Settings className="h-4 w-4 mr-1" />
              {mapboxToken ? 'Update Token' : 'Add Mapbox Token'}
            </Button>
            {authState.isAuthenticated && authState.user?.role === 'admin' && (
              <Button
                variant={isAdminMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAdminMode(!isAdminMode)}
              >
                {isAdminMode ? 'Exit Admin' : 'Admin Mode'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Token Input */}
          {showTokenInput && (
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter your Mapbox public token to enable the interactive map. 
                Get one free at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="pk.eyJ1Ij..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveToken}>Save Token</Button>
              </div>
            </div>
          )}

          {/* Admin Controls */}
          {isAdminMode && (
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Location Name</label>
                    <Input
                      placeholder="Enter location name"
                      value={newLocation.name || ''}
                      onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      className="w-full p-2 border rounded-md bg-background"
                      value={newLocation.type || 'store'}
                      onChange={(e) => setNewLocation({...newLocation, type: e.target.value as Location['type']})}
                    >
                      <option value="store">Store</option>
                      <option value="gallery">Gallery</option>
                      <option value="warehouse">Warehouse</option>
                      <option value="office">Office</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <Input
                      placeholder="Enter full address"
                      value={newLocation.address || ''}
                      onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Latitude</label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="24.7136"
                      value={newLocation.coordinates?.lat || ''}
                      onChange={(e) => setNewLocation({
                        ...newLocation,
                        coordinates: {
                          lat: parseFloat(e.target.value) || 0,
                          lng: newLocation.coordinates?.lng || 0
                        }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Longitude</label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="46.6753"
                      value={newLocation.coordinates?.lng || ''}
                      onChange={(e) => setNewLocation({
                        ...newLocation,
                        coordinates: {
                          lat: newLocation.coordinates?.lat || 0,
                          lng: parseFloat(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                </div>
                <Button onClick={addLocation} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Map Container */}
          <div className="relative rounded-lg overflow-hidden" style={{ height: '400px' }}>
            {mapboxToken ? (
              <div ref={mapContainer} className="absolute inset-0" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="text-center p-6">
                  <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                  <p className="text-muted-foreground mb-4">
                    {locations.filter(loc => loc.isActive).length} locations across Saudi Arabia
                  </p>
                  <Button onClick={() => setShowTokenInput(true)}>
                    Add Mapbox Token to Enable
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Locations List */}
          <div className="grid gap-4 md:grid-cols-2">
            {locations.filter(loc => loc.isActive).map((location) => (
              <div
                key={location.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedLocation?.id === location.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => {
                  setSelectedLocation(location);
                  if (map.current) {
                    map.current.flyTo({
                      center: [location.coordinates.lng, location.coordinates.lat],
                      zoom: 12,
                      duration: 1500,
                    });
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xl">{getLocationTypeIcon(location.type)}</span>
                      <h3 className="font-semibold truncate">{location.name}</h3>
                      <Badge className={getLocationTypeColor(location.type)}>
                        {location.type}
                      </Badge>
                      {location.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{location.rating}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground line-clamp-1">{location.address}</span>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {location.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{location.phone}</span>
                        </div>
                      )}
                      {location.hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="truncate max-w-32">{location.hours}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInMaps(location);
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Directions
                    </Button>

                    {isAdminMode && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLocation(location.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Location Details */}
          {selectedLocation && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{selectedLocation.name}</h4>
                    <p className="text-muted-foreground mb-3">{selectedLocation.address}</p>
                    {selectedLocation.description && (
                      <p className="text-sm mb-3">{selectedLocation.description}</p>
                    )}
                  </div>
                  <Button onClick={() => openInMaps(selectedLocation)} className="shrink-0">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;
