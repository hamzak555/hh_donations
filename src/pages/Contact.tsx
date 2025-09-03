import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, CheckCircle, ArrowRight, Heart, Building, AlertCircle, MapPin } from 'lucide-react';
import Footer from '@/components/Footer';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const ContactForm = () => {
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
  
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (!executeRecaptcha) {
      setValidationError('reCAPTCHA not ready. Please try again.');
      return;
    }

    if (!isSupabaseConfigured) {
      setValidationError('Email service is not configured. Please try again later.');
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    try {
      console.log('Submitting contact form with data:', formData);
      console.log('Supabase configured:', !!supabase);
      console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
      
      // Execute reCAPTCHA v3
      const recaptchaToken = await executeRecaptcha('contact_form');
      console.log('reCAPTCHA token obtained:', !!recaptchaToken);
      if (!recaptchaToken) {
        setValidationError('reCAPTCHA verification failed. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      console.log('Invoking Supabase function: send-contact-email');
      // Call Supabase edge function to send contact email
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          recaptchaToken: recaptchaToken
        }
      });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Error calling edge function:', error);
        setValidationError('There was an error sending your message. Please try again.');
        setIsSubmitting(false);
        return;
      }

      if (!data?.success) {
        console.error('Edge function returned error:', data);
        setValidationError(data?.error || 'Failed to send email');
        setIsSubmitting(false);
        return;
      }
      
      console.log('Contact form submitted successfully:', data);
      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setValidationError('There was an error sending your message. Please try again.');
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
      <div className="max-w-4xl mx-auto pt-10 pb-12 px-4 sm:px-8">
        <div>
          {/* Contact Form */}
          <div>
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

                  <div className="text-sm text-gray-600 mb-4">
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline">Privacy Policy</a> and{' '}
                    <a href="https://policies.google.com/terms" className="text-blue-600 hover:underline">Terms of Service</a> apply.
                  </div>

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

const Contact = () => {
  // Use Google's test key if no production key is set
  const recaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
  console.log('reCAPTCHA Site Key:', recaptchaKey ? 'Configured' : 'Missing');
  
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <ContactForm />
    </GoogleReCaptchaProvider>
  );
};

export default Contact;