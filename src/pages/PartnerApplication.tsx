import React, { useState, useEffect } from 'react';
import { usePartnerApplications } from '@/contexts/PartnerApplicationsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const PartnerApplication = () => {
  const { addApplication } = usePartnerApplications();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Organization Information
    organizationName: '',
    taxId: '',
    website: '',

    // Step 2: Contact Information
    contactPerson: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },

    // Step 3: Additional Information
    additionalInfo: ''
  });

  const totalSteps = 3;

  const steps = [
    { number: 1, title: 'Organization', icon: Building },
    { number: 2, title: 'Contact', icon: User },
    { number: 3, title: 'Questions', icon: MessageSquare }
  ];

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGoogleMapsLoaded(true);
    document.head.appendChild(script);

    return () => {
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      scripts.forEach(s => s.remove());
    };
  }, []);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear validation error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleAddressChange = (address: typeof formData.address) => {
    setFormData(prev => ({ ...prev, address }));
    // Clear address validation errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors['address.street'];
      delete newErrors['address.city'];
      delete newErrors['address.state'];
      delete newErrors['address.zipCode'];
      return newErrors;
    });
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.organizationName) errors.organizationName = 'Organization name is required';
        break;

      case 2:
        if (!formData.contactPerson) errors.contactPerson = 'Contact person is required';
        if (!formData.email) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Please enter a valid email address';
        }
        if (!formData.phone) errors.phone = 'Phone number is required';
        if (!formData.address.street) errors['address.street'] = 'Street address is required';
        if (!formData.address.city) errors['address.city'] = 'City is required';
        if (!formData.address.state) errors['address.state'] = 'State/Province is required';
        if (!formData.address.zipCode) errors['address.zipCode'] = 'ZIP/Postal code is required';
        break;

      case 3:
        // No required fields in step 3
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Add application to context
      addApplication({
        organizationName: formData.organizationName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        taxId: formData.taxId,
        address: formData.address,
        additionalInfo: formData.additionalInfo
      });

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting application:', error);
      setValidationErrors({ submit: 'There was an error submitting your application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <SEO 
          title="Application Submitted - Partner with H&H Donations"
          description="Thank you for your interest in partnering with H&H Donations"
          url="/partner-application"
        />
        <div className="min-h-screen bg-gray-50 px-8">
          <div className="max-w-4xl mx-auto pt-20 pb-24">
            <div className="text-center mb-12">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for your interest in partnering with H&H Donations. 
                We'll review your application and contact you within 2-3 business days.
              </p>
            </div>
            
            <Card className="border border-gray-200 mb-8">
              <CardContent className="p-8">
                <h3 className="font-semibold text-gray-900 mb-4">What Happens Next?</h3>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">1</span>
                    <span className="text-gray-700">Our team will review your application</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">2</span>
                    <span className="text-gray-700">We'll contact you to discuss partnership details</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">3</span>
                    <span className="text-gray-700">Once approved, we'll set up your organization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">4</span>
                    <span className="text-gray-700">Start making a difference together!</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <Button onClick={() => window.location.href = '/home'}>
                Return to Home
              </Button>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Become a Partner - Join Our Mission"
        description="Apply to partner with H&H Donations and help us provide clothing to families in need around the world."
        url="/partner-application"
      />
      <div className="min-h-screen bg-gray-50 px-8">
        <div className="max-w-4xl mx-auto pt-10 pb-12">
          {/* Back Link */}
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/partnerships'}
            className="mb-6 flex items-center gap-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Partnerships
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Partner Application</h1>
            <p className="text-xl text-gray-600">
              Join our network of organizations making a global impact
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors relative z-10
                        ${isActive ? 'bg-primary border-primary text-white' : 
                          isCompleted ? 'bg-green-600 border-green-600 text-white' : 
                          'bg-white border-gray-300 text-gray-400'}
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium whitespace-nowrap ${
                        isActive ? 'text-primary' : 
                        isCompleted ? 'text-green-600' : 
                        'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex items-center" style={{ marginTop: '-1.5rem' }}>
                        <div className={`h-0.5 w-32 mx-3 transition-colors ${
                          currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                        }`} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Form Card */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
                Step {currentStep} of {totalSteps}: {steps[currentStep - 1].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
                {/* Step 1: Organization Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="organizationName">Organization Name *</Label>
                      <Input
                        id="organizationName"
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange('organizationName', e.target.value)}
                        placeholder="Enter your organization name"
                        className={validationErrors.organizationName ? 'border-red-500' : ''}
                      />
                      {validationErrors.organizationName && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.organizationName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="taxId">Tax ID Number (Optional)</Label>
                      <Input
                        id="taxId"
                        value={formData.taxId}
                        onChange={(e) => handleInputChange('taxId', e.target.value)}
                        placeholder="For tax-exempt organizations"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        If you're a registered non-profit, providing your tax ID can help expedite the process
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="website">Website (Optional)</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://www.example.org"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Contact Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="contactPerson">Primary Contact Person *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="contactPerson"
                          value={formData.contactPerson}
                          onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                          placeholder="Full name"
                          className={`pl-10 ${validationErrors.contactPerson ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {validationErrors.contactPerson && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.contactPerson}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="email@example.org"
                            className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {validationErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                        )}
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
                            placeholder="(555) 123-4567"
                            className={`pl-10 ${validationErrors.phone ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {validationErrors.phone && (
                          <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Organization Address
                      </h3>
                      
                      {isGoogleMapsLoaded ? (
                        <>
                          <div>
                            <Label htmlFor="address">Start typing your address *</Label>
                            <AddressAutocomplete
                              value={formData.address}
                              onChange={handleAddressChange}
                              className={validationErrors['address.street'] ? 'border-red-500' : ''}
                              required
                            />
                            {validationErrors['address.street'] && (
                              <p className="text-red-500 text-sm mt-1">{validationErrors['address.street']}</p>
                            )}
                          </div>

                          {/* Show parsed address fields as read-only */}
                          {formData.address.street && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div>
                                <Label className="text-sm text-gray-600">City</Label>
                                <p className="font-medium">{formData.address.city || 'Not detected'}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-gray-600">State/Province</Label>
                                <p className="font-medium">{formData.address.state || 'Not detected'}</p>
                              </div>
                              <div>
                                <Label className="text-sm text-gray-600">ZIP/Postal Code</Label>
                                <p className="font-medium">{formData.address.zipCode || 'Not detected'}</p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        // Fallback to manual entry if Google Maps isn't loaded
                        <>
                          <div>
                            <Label htmlFor="street">Street Address *</Label>
                            <Input
                              id="street"
                              value={formData.address.street}
                              onChange={(e) => handleInputChange('address.street', e.target.value)}
                              placeholder="123 Main Street"
                              className={validationErrors['address.street'] ? 'border-red-500' : ''}
                            />
                            {validationErrors['address.street'] && (
                              <p className="text-red-500 text-sm mt-1">{validationErrors['address.street']}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="city">City *</Label>
                              <Input
                                id="city"
                                value={formData.address.city}
                                onChange={(e) => handleInputChange('address.city', e.target.value)}
                                placeholder="City name"
                                className={validationErrors['address.city'] ? 'border-red-500' : ''}
                              />
                              {validationErrors['address.city'] && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors['address.city']}</p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="state">State/Province *</Label>
                              <Input
                                id="state"
                                value={formData.address.state}
                                onChange={(e) => handleInputChange('address.state', e.target.value)}
                                placeholder="State/Province"
                                className={validationErrors['address.state'] ? 'border-red-500' : ''}
                              />
                              {validationErrors['address.state'] && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors['address.state']}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="zipCode">ZIP/Postal Code *</Label>
                            <Input
                              id="zipCode"
                              value={formData.address.zipCode}
                              onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                              placeholder="12345"
                              className={validationErrors['address.zipCode'] ? 'border-red-500' : ''}
                            />
                            {validationErrors['address.zipCode'] && (
                              <p className="text-red-500 text-sm mt-1">{validationErrors['address.zipCode']}</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Additional Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="additionalInfo">Questions or Additional Information (Optional)</Label>
                      <Textarea
                        id="additionalInfo"
                        value={formData.additionalInfo}
                        onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                        placeholder="Do you have any questions about the partnership? Is there anything else you'd like us to know?"
                        rows={6}
                        className="resize-none"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Feel free to share any questions, concerns, or additional information that might help us better understand your organization.
                      </p>
                    </div>

                    {/* Summary Review */}
                    <Alert className="border-primary/20 bg-primary/5">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please review your application before submitting. You can go back to any previous step to make changes.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Error Alert */}
                {validationErrors.submit && (
                  <Alert className="mt-4 border-red-500 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {validationErrors.submit}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button type="submit" className="flex items-center gap-0.5">
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="min-w-[150px]"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default PartnerApplication;