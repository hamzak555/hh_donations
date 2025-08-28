import React, { useState, useRef } from 'react';
import { GoogleMap, Autocomplete } from '@react-google-maps/api';
import { DelayedMarker as SafeMarker } from '@/components/DelayedMarker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarDays, MapPin, Phone, Mail, User, Clock, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { usePickupRequests } from '@/contexts/PickupRequestsContextSupabase';

const RequestPickup = () => {
  const { addPickupRequest } = usePickupRequests();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    additionalNotes: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [mapKey, setMapKey] = useState(Date.now()); // Add key state for forcing map remount

  const mapContainerStyle = {
    width: '100%',
    height: '300px'
  };

  const center = location || { lat: 43.6532, lng: -79.3832 };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onAutocompleteLoad = (autocompleteInstance: any) => {
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
      setValidationError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    try {
      // Use context to add the pickup request
      // Format date in Eastern Time zone
      const easternDate = selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/New_York'
      });
      
      // Convert MM/DD/YYYY to YYYY-MM-DD format
      const [month, day, year] = easternDate.split('/');
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      
      const pickupRequest = {
        ...formData,
        date: formattedDate,
        time: '9:00 AM - 4:00 PM', // Default time range for pickups
        location: location || undefined,
        submittedAt: new Date().toISOString(),
        status: 'Pending' as const
      };

      await addPickupRequest(pickupRequest);
      console.log('Pickup request submitted:', pickupRequest);
      
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
      setValidationError('There was an error submitting your request. Please try again.');
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
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => {
                // Simply reload the page to ensure everything resets properly
                window.location.reload();
              }}
              className="w-full sm:w-auto"
            >
              Submit Another Request
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/home'} className="w-full sm:w-auto">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-8 pt-10 pb-6">
        <h1 className="text-3xl font-bold">Request a Pickup</h1>
      </div>
      
      {/* Main Content Area - Full Height */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 px-8 pb-6 lg:overflow-hidden">
        {/* Left Column - Info Section and Form */}
        <div className="h-auto lg:h-full flex flex-col gap-4 lg:overflow-y-auto lg:pr-2">
          {/* Info Section - Redesigned */}
          <div>
            {/* Important Alert Banner */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-500 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">Pickup Schedule</p>
                  <p className="text-green-800 text-sm">
                    Available <strong>Tuesdays and Thursdays only</strong> between <strong>9:00 AM - 4:00 PM</strong>. 
                    Please leave donations on your front porch during these hours.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full flex items-center justify-center w-10 h-10 flex-shrink-0">
                    <span className="text-primary font-bold text-lg">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Fill Out Form</h3>
                    <p className="text-gray-600 text-sm">
                      Complete the pickup request form below with your contact details and preferred pickup date.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full flex items-center justify-center w-10 h-10 flex-shrink-0">
                    <span className="text-primary font-bold text-lg">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pickup Day</h3>
                    <p className="text-gray-600 text-sm">
                      Leave your donation on your front porch. We will collect it during scheduled hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-4 flex-shrink-0">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Pickup Details
              </CardTitle>
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
                  <span className="text-sm text-gray-600">
                    {currentStep === 1 && "Contact Info"}
                    {currentStep === 2 && "Location & Date"}
                    {currentStep === 3 && "Additional Details"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex-1 lg:overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5 h-auto lg:h-full flex flex-col">
                <div className="flex-1">
                  {/* Step 1: Contact Information */}
                  {currentStep === 1 && (
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
                  )}

                  {/* Step 2: Location & Date */}
                  {currentStep === 2 && (
                  <>
                    {/* Location */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Pickup Location & Date
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
                      
                      <div>
                        <Label>Pickup Date *</Label>
                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
                              onSelect={(date) => {
                                setSelectedDate(date);
                                setIsCalendarOpen(false); // Close calendar when date is selected
                              }}
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
                        </p>
                      </div>
                    </div>
                  </>
                  )}

                  {/* Step 3: Additional Details */}
                  {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Additional Details
                    </h3>
                    
                    <div>
                      <Label htmlFor="notes">Pickup Notes (Optional)</Label>
                      <textarea
                        id="notes"
                        value={formData.additionalNotes}
                        onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                        placeholder="Any special instructions, item descriptions, or accessibility information..."
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 h-20 resize-none"
                      />
                    </div>
                    
                    {/* Summary of entered information */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Request Summary:</h4>
                      <div className="text-xs space-y-0.5">
                        <p><span className="font-medium">Name:</span> {formData.name || 'Not provided'}</p>
                        <p><span className="font-medium">Email:</span> {formData.email || 'Not provided'}</p>
                        <p><span className="font-medium">Phone:</span> {formData.phone || 'Not provided'}</p>
                        <p><span className="font-medium">Address:</span> {formData.address || 'Not provided'}</p>
                        <p><span className="font-medium">Date:</span> {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Not selected'}</p>
                      </div>
                    </div>
                  </div>
                  )}
                </div>

                {/* Validation Alert */}
                {validationError && (
                  <Alert className="border-red-500 bg-red-50 flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <AlertDescription className="text-red-800 flex-1">
                      {validationError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setValidationError('');
                        setCurrentStep(currentStep - 1);
                      }}
                      className="flex-1"
                    >
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setValidationError('');
                        // Validate current step before proceeding
                        if (currentStep === 1) {
                          if (!formData.name || !formData.email || !formData.phone) {
                            setValidationError('Please fill in all required contact information fields.');
                            return;
                          }
                        } else if (currentStep === 2) {
                          if (!formData.address || !selectedDate) {
                            setValidationError('Please provide both pickup address and date.');
                            return;
                          }
                        }
                        setCurrentStep(currentStep + 1);
                      }}
                      className={currentStep === 1 ? 'w-full' : 'flex-1'}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Pickup Request'}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Map */}
        <div className="h-auto lg:h-full lg:overflow-hidden">
          <Card className="h-auto lg:h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Pickup Location Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="flex-1 min-h-[300px]">
                {!isSubmitted && ( // Only render map when not in submitted state
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={center}
                      zoom={location ? 15 : 10}
                    >
                    {location && (
                      <SafeMarker 
                        position={location}
                        title="Pickup Location"
                        icon={{
                          url: '/images/hh map pin icon.png',
                          scaledSize: window.google && window.google.maps ? new window.google.maps.Size(30, 30) : undefined,
                          origin: window.google && window.google.maps ? new window.google.maps.Point(0, 0) : undefined,
                          anchor: window.google && window.google.maps ? new window.google.maps.Point(15, 30) : undefined
                        }}
                      />
                    )}
                    </GoogleMap>
                )}
              </div>
            
              {/* Find a Bin Instead Section */}
              <div className="px-6 py-6 bg-primary/5 border-t flex-shrink-0">
                <div className="text-center">
                  <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">Need donations picked up today?</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="lg" className="w-full" asChild>
                      <a href="/find-bin" className="flex items-center justify-center gap-0.5">
                        <MapPin className="h-5 w-5" />
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
    </div>
  );
};

export default RequestPickup;