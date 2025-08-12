import React, { useState, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, MapPin, Phone, Mail, User, Clock, CheckCircle, Search } from 'lucide-react';
import { format } from 'date-fns';
import Footer from '@/components/Footer';
import { usePickupRequests } from '@/contexts/PickupRequestsContext';

const RequestPickup = () => {
  const { addPickupRequest } = usePickupRequests();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    additionalNotes: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const mapContainerStyle = {
    width: '100%',
    height: '300px'
  };

  const center = location || { lat: 43.6532, lng: -79.3832 };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onAutocompleteLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        setLocation(newLocation);
        
        if (place.formatted_address) {
          setFormData(prev => ({ ...prev, address: place.formatted_address || '' }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.address || !selectedDate) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Use context to add the pickup request
      const pickupRequest = {
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: '9:00 AM - 4:00 PM', // Default time range for pickups
        location: location || undefined,
        submittedAt: new Date().toISOString(),
        status: 'Pending' as const
      };

      addPickupRequest(pickupRequest);
      console.log('Pickup request submitted:', pickupRequest);
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 px-8">
        <div className="max-w-6xl mx-auto pt-20 pb-24">
          <div className="text-center mb-12">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h1>
            <p className="text-lg text-gray-600">
              Thank you for your pickup request. We'll contact you within 24 hours to confirm the details.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border text-left">
              <h3 className="font-semibold text-gray-900 mb-4">Request Summary:</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {formData.name}</div>
                <div><strong>Email:</strong> {formData.email}</div>
                <div><strong>Phone:</strong> {formData.phone}</div>
                <div><strong>Address:</strong> {formData.address}</div>
                <div><strong>Pickup Date:</strong> {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}</div>
                <div><strong>Pickup Time:</strong> Between 9:00 AM - 4:00 PM</div>
                {formData.additionalNotes && (
                  <div><strong>Notes:</strong> {formData.additionalNotes}</div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg flex items-center justify-center">
              <img 
                src="/images/Placeholder 1.jpg" 
                alt="Donation pickup success"
                className="w-full h-full object-cover rounded-lg"
                style={{ minHeight: '250px' }}
              />
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  address: '',
                  date: '',
                  additionalNotes: ''
                });
                setSelectedDate(undefined);
                setLocation(null);
              }}
              className="mr-4"
            >
              Submit Another Request
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/home'}>
              Return to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-8">
      <div className="max-w-6xl mx-auto pt-10 pb-12">
        {/* Info Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">How to Request a Pickup</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Important Pickup Information:</p>
              <p className="text-sm text-amber-700">
                Pickups are only available on <strong>Tuesdays and Thursdays between 9:00 AM and 4:00 PM</strong>. 
                Please leave your donation on your front porch during these times on your selected pickup date.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="font-semibold text-primary mb-2">1. Fill Out Form</div>
                <p className="text-gray-600">Complete the pickup request form below with your contact details and pickup date (Tuesday or Thursday only).</p>
              </div>
              <div>
                <div className="font-semibold text-primary mb-2">2. Confirmation</div>
                <p className="text-gray-600">We'll contact you within 24 hours to confirm your pickup details.</p>
              </div>
              <div>
                <div className="font-semibold text-primary mb-2">3. Pickup Day</div>
                <p className="text-gray-600">Leave your donation on your front porch. Our team will collect it between 9 AM - 4 PM.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Pickup Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Pickup Location
                  </h3>
                  
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <div className="relative autocomplete-container">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                      {isGoogleMapsLoaded ? (
                        <Autocomplete
                          onLoad={onAutocompleteLoad}
                          onPlaceChanged={onPlaceChanged}
                          options={{
                            componentRestrictions: { country: 'ca' },
                            fields: ['formatted_address', 'geometry']
                          }}
                          className="w-full"
                        >
                          <Input
                            ref={addressInputRef}
                            id="address"
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="Enter pickup address"
                            className="pl-10 w-full"
                            required
                          />
                        </Autocomplete>
                      ) : (
                        <Input
                          id="address"
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="Enter pickup address"
                          className="pl-10 w-full"
                          required
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pickup Schedule
                  </h3>
                  
                  <div>
                    <Label>Pickup Date * (Tuesday or Thursday only)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, 'PPP') : 'Select a Tuesday or Thursday'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const dayOfWeek = date.getDay();
                            // Only allow Tuesday (2) and Thursday (4), and must be in the future
                            return date < today || (dayOfWeek !== 2 && dayOfWeek !== 4);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs text-gray-500 mt-1">
                      Pickups occur between 9:00 AM - 4:00 PM on your selected date.
                      Please leave your donation on your front porch.
                    </p>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Any special instructions, item descriptions, or accessibility information..."
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px] resize-vertical"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Pickup Request'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Pickup Location</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LoadScript 
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}
                libraries={['places']}
                loadingElement={<div className="w-full h-[300px] bg-gray-100 animate-pulse" />}
                onLoad={() => setIsGoogleMapsLoaded(true)}
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={location ? 15 : 10}
                >
                  {location && (
                    <Marker 
                      position={location}
                      title="Pickup Location"
                      icon={{
                        url: '/images/hh map pin icon.png',
                        scaledSize: new google.maps.Size(30, 30),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(15, 30)
                      }}
                    />
                  )}
                </GoogleMap>
              </LoadScript>
            
              {/* Find a Bin Instead Section */}
              <div className="px-8 py-24 bg-primary/5 border-t">
                <div className="text-center">
                  <Clock className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">Need donations picked up today?</h4>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    Consider using one of our 24/7 donation bins instead - no waiting required! 
                    It's faster and you can donate anytime that works for you.
                  </p>
                  <div className="space-y-3">
                    <Button variant="outline" size="lg" className="w-full" asChild>
                      <a href="/find-bin">
                        <MapPin className="mr-2 h-5 w-5" />
                        Find a Donation Bin Near You
                      </a>
                    </Button>
                    <p className="text-sm text-gray-500">
                      ✓ Perfect for small to medium donations • Available 24/7
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RequestPickup;