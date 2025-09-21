import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Phone, Clock, Star, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
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
      hours: 'Mon-Fri: 9:00 AM - 10:00 PM, Sat-Sun: 10:00 AM - 11:00 PM',
      rating: 4.8,
      description: 'Our flagship store featuring the complete collection of fresh flowers and custom arrangements.',
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
      description: 'Premium gallery showcasing luxury floral arrangements and wedding collections.',
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
      description: 'Full-service store with delivery center and custom bouquet design studio.',
      isActive: true
    },
    {
      id: '4',
      name: 'Dammam Gallery',
      type: 'gallery',
      address: '321 King Fahd Road, Dammam, Saudi Arabia',
      coordinates: { lat: 26.4207, lng: 50.0888 },
      phone: '+966 50 456 7890',
      hours: 'Mon-Sat: 10:00 AM - 10:00 PM, Sun: 2:00 PM - 10:00 PM',
      rating: 4.6,
      description: 'Specialized gallery for premium and exotic flower collections.',
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
      description: 'Main distribution center ensuring fresh flower delivery across the kingdom.',
      isActive: true
    },
    {
      id: '6',
      name: 'Mecca Showroom',
      type: 'store',
      address: 'Al Haram District, Mecca, Saudi Arabia',
      coordinates: { lat: 21.3891, lng: 39.8579 },
      phone: '+966 50 678 9012',
      hours: 'Mon-Sun: 8:00 AM - 12:00 AM',
      rating: 4.8,
      description: 'Specialized store for religious occasions and traditional arrangements.',
      isActive: true
    }
  ];

  useEffect(() => {
    // Load locations from localStorage or use defaults
    const savedLocations = localStorage.getItem('roses-garden-locations');
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    } else {
      setLocations(defaultLocations);
      localStorage.setItem('roses-garden-locations', JSON.stringify(defaultLocations));
    }
  }, []);

  const saveLocations = (newLocations: Location[]) => {
    setLocations(newLocations);
    localStorage.setItem('roses-garden-locations', JSON.stringify(newLocations));
  };

  const openInMaps = (location: Location) => {
    const { lat, lng } = location.coordinates;
    const address = encodeURIComponent(location.address);

    // Try to open in device map app
    if (navigator.userAgent.match(/iPhone|iPad|iPod/)) {
      // iOS
      window.location.href = `maps:///?daddr=${lat},${lng}&dirflg=d`;
    } else if (navigator.userAgent.match(/Android/)) {
      // Android
      window.location.href = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(location.name)})`;
    } else {
      // Fallback to Google Maps
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${address}`, '_blank');
    }
  };

  const getLocationTypeColor = (type: Location['type']) => {
    switch (type) {
      case 'store': return 'bg-green-100 text-green-800';
      case 'gallery': return 'bg-purple-100 text-purple-800';
      case 'warehouse': return 'bg-blue-100 text-blue-800';
      case 'office': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationTypeIcon = (type: Location['type']) => {
    switch (type) {
      case 'store': return '🏪';
      case 'gallery': return '🎨';
      case 'warehouse': return '🏭';
      case 'office': return '🏢';
      default: return '📍';
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
    }
  };

  const removeLocation = (id: string) => {
    const updatedLocations = locations.filter(loc => loc.id !== id);
    saveLocations(updatedLocations);
    if (selectedLocation?.id === id) {
      setSelectedLocation(null);
    }
  };

  const toggleLocationStatus = (id: string) => {
    const updatedLocations = locations.map(loc =>
      loc.id === id ? { ...loc, isActive: !loc.isActive } : loc
    );
    saveLocations(updatedLocations);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Our Locations
          </CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter location name"
                      value={newLocation.name || ''}
                      onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      className="w-full p-2 border rounded-md"
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
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter full address"
                      value={newLocation.address || ''}
                      onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full p-2 border rounded-md"
                      placeholder="24.7136"
                      value={newLocation.coordinates?.lat || ''}
                      onChange={(e) => setNewLocation({
                        ...newLocation,
                        coordinates: {
                          ...newLocation.coordinates,
                          lat: parseFloat(e.target.value) || 0
                        } as {lat: number, lng: number}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className="w-full p-2 border rounded-md"
                      placeholder="46.6753"
                      value={newLocation.coordinates?.lng || ''}
                      onChange={(e) => setNewLocation({
                        ...newLocation,
                        coordinates: {
                          ...newLocation.coordinates,
                          lng: parseFloat(e.target.value) || 0
                        } as {lat: number, lng: number}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      className="w-full p-2 border rounded-md"
                      placeholder="+966 50 123 4567"
                      value={newLocation.phone || ''}
                      onChange={(e) => setNewLocation({...newLocation, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Hours</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="Mon-Fri: 9:00 AM - 10:00 PM"
                      value={newLocation.hours || ''}
                      onChange={(e) => setNewLocation({...newLocation, hours: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      className="w-full p-2 border rounded-md"
                      rows={3}
                      placeholder="Brief description of this location"
                      value={newLocation.description || ''}
                      onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
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

          {/* Locations List */}
          <div className="grid gap-4">
            {locations.filter(loc => loc.isActive).map((location) => (
              <div
                key={location.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedLocation?.id === location.id ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onClick={() => setSelectedLocation(location)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getLocationTypeIcon(location.type)}</span>
                      <h3 className="font-semibold text-lg">{location.name}</h3>
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
                      <span className="text-sm text-muted-foreground">{location.address}</span>
                    </div>

                    {location.description && (
                      <p className="text-sm text-muted-foreground mb-2">{location.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {location.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{location.phone}</span>
                        </div>
                      )}
                      {location.hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{location.hours}</span>
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
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLocationStatus(location.id);
                          }}
                        >
                          {location.isActive ? 'Disable' : 'Enable'}
                        </Button>
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map Visualization Placeholder */}
          <div className="bg-muted rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-50" />
            <div className="relative z-10 text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
              <p className="text-muted-foreground mb-4">
                {locations.filter(loc => loc.isActive).length} locations across Saudi Arabia
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {locations.filter(loc => loc.isActive).map((location) => (
                  <button
                    key={location.id}
                    onClick={() => setSelectedLocation(location)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedLocation?.id === location.id
                        ? 'bg-primary text-white'
                        : 'bg-white text-primary border border-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {getLocationTypeIcon(location.type)} {location.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Simple map-like dots */}
            <div className="absolute inset-0">
              {locations.filter(loc => loc.isActive).map((location) => (
                <div
                  key={location.id}
                  className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-md cursor-pointer transition-all hover:scale-125 ${
                    selectedLocation?.id === location.id
                      ? 'bg-primary scale-125'
                      : 'bg-primary/70 hover:bg-primary'
                  }`}
                  style={{
                    left: `${((location.coordinates.lng - 39) / (51 - 39)) * 100}%`,
                    top: `${((location.coordinates.lat - 16) / (32 - 16)) * 100}%`,
                  }}
                  onClick={() => setSelectedLocation(location)}
                />
              ))}
            </div>
          </div>

          {selectedLocation && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{selectedLocation.name}</h4>
                    <p className="text-muted-foreground mb-3">{selectedLocation.address}</p>
                    {selectedLocation.description && (
                      <p className="text-sm mb-3">{selectedLocation.description}</p>
                    )}
                  </div>
                  <Button onClick={() => openInMaps(selectedLocation)}>
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