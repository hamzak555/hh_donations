import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, ArrowRight, Heart, Building, AlertCircle } from 'lucide-react';
import Footer from '@/components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Contact form submitted:', formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setValidationError('There was an error sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto pt-20 pb-24 px-4 sm:px-8">
          <div className="text-center mb-12">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Message Sent!</h1>
            <p className="text-sm sm:text-lg text-gray-600">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
          </div>
          
          <div className="text-center">
            <Button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  subject: '',
                  message: ''
                });
              }}
              className="mr-4"
            >
              Send Another Message
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto pt-10 pb-12 px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <p className="text-sm sm:text-base text-gray-600">info@hhdonations.org</p>
                    <p className="text-sm sm:text-base text-gray-600">support@hhdonations.org</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Phone</p>
                    <p className="text-sm sm:text-base text-gray-600">(416) 555-0123</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 9 AM - 5 PM</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Address</p>
                    <p className="text-sm sm:text-base text-gray-600">
                      123 Community Drive<br />
                      Toronto, ON M5V 3A8<br />
                      Canada
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Business Hours</p>
                    <p className="text-sm sm:text-base text-gray-600">
                      Monday - Friday: 9:00 AM - 5:00 PM<br />
                      Saturday: 10:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone and Subject */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="What's this about?"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us how we can help you..."
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[120px] resize-vertical"
                      required
                    />
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

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto" 
                    disabled={isSubmitting}
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Sections */}
        <div className="mt-12 space-y-8">
          {/* Partnership CTA */}
          <Card className="bg-gradient-to-r from-primary/5 to-green-50 border-primary/20">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="bg-primary/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Become a Location Partner</h2>
              <p className="text-sm sm:text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                Host a smart donation bin at your location and earn $1,000/year while supporting your community. 
                Our sensor-equipped bins ensure cleanliness with automatic alerts when they need emptying.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">Guaranteed annual revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">Zero operational burden</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">Smart sensor technology</span>
                </div>
              </div>
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <a href="/partnerships" className="flex items-center gap-0.5">
                  Learn About Partnerships
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Donation CTA */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 sm:p-16 text-center">
            <div className="bg-primary/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Ready to Make a Donation?</h2>
            <p className="text-sm sm:text-xl text-gray-600 mb-6 sm:mb-8">
              Don't wait to get started! You can find a donation bin near you or schedule a pickup right now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <a href="/find-bin" className="flex items-center gap-0.5">
                  <MapPin className="h-5 w-5" />
                  Find a Donation Bin
                </a>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <a href="/request-pickup">
                  Request Pickup
                </a>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                <a href="/faq" className="flex items-center gap-0.5">
                  View FAQ
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;