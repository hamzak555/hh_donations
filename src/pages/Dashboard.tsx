import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MapPin, ArrowRight, CheckCircle, Building, Home, School, Heart, Package } from 'lucide-react';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

function Dashboard() {
  const [activePartner, setActivePartner] = useState(0);
  
  const partners = [
    {
      icon: <Building className="h-6 w-6" />,
      title: "Community Centers",
      description: "Working with local community centers to serve families and individuals in need.",
      image: "/images/Placeholder 4.jpg",
      details: "We partner with over 20 community centers across the region, ensuring donations reach those who need them most through established local networks."
    },
    {
      icon: <Home className="h-6 w-6" />,
      title: "Local Shelters",
      description: "Partnering with shelters to provide essential items to those experiencing homelessness.",
      image: "/images/Placeholder 5.jpg",
      details: "Our shelter partnerships provide immediate relief to individuals and families in crisis, delivering warm clothing, hygiene products, and household essentials."
    },
    {
      icon: <School className="h-6 w-6" />,
      title: "Schools & Programs",
      description: "Supporting educational programs and helping students in need access essential supplies.",
      image: "/images/Placeholder 6.jpg",
      details: "We work with schools to identify students in need, providing clothing, school supplies, and backpacks to ensure every child can focus on learning."
    }
  ];
  return (
    <>
      <SEO 
        title="Home"
        description="H&H Donations makes clothing donation simple and accessible. Find donation bins near you or schedule a pickup to help families in need across your community."
        url="/home"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "H&H Donations",
          "url": "https://hhdonations.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://hhdonations.com/find-bin?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] lg:min-h-[700px]">
          {/* Left Column - Text Content */}
          <div className="flex items-center py-12 lg:py-20 px-6 sm:px-8">
            <div className="max-w-xl mx-auto lg:ml-auto lg:mr-12">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Making Donations
                <span className="text-primary block">Simple & Accessible</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Find donation bins in your community and make a lasting impact. Every donation 
                helps families in need and strengthens our neighborhoods.
              </p>
              
              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <a href="/request-pickup" className="flex items-center gap-0.5">
                    <Package className="h-5 w-5" />
                    Request a Pickup
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                  <a href="/partnerships" className="flex items-center gap-0.5">
                    Become a Partner
                    <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-10 mt-12">
                <div>
                  <div className="text-3xl font-bold text-primary">50+</div>
                  <div className="text-sm text-gray-600">Active Bins</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-gray-600">Families Helped</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-gray-600">Always Open</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Full Height Image */}
          <div className="relative h-[400px] lg:h-auto overflow-hidden rounded-t-2xl lg:rounded-t-none lg:rounded-l-2xl">
            <img 
              src="/images/Placeholder 1.jpg" 
              alt="Volunteers sorting donated clothes at H&H Donations community center - helping families in need"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
            
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
            
            {/* Floating badge */}
            <div className="absolute bottom-8 left-8 bg-white rounded-lg border border-gray-200 p-4 z-20">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">Always Available</div>
                  <div className="text-sm text-gray-600">Drop off anytime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Redesigned */}
      <section className="py-12 sm:py-16 lg:py-20 px-6 sm:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Making a difference has never been easier. Follow these three simple steps to help families in need.
            </p>
          </div>
          
          {/* Steps Grid - Modern Card Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Line for Desktop */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20"></div>
            
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-lg p-8 border border-gray-200">
                
                {/* Icon Container */}
                <div className="mb-6 relative">
                  <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="h-10 w-10 text-primary" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Find a Bin</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Use our interactive map to locate the nearest donation bin. Available 24/7 for your convenience.
                </p>
                
                {/* Quick Stats */}
                <div className="flex items-center justify-between mb-6 py-3 px-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Bins Available</span>
                  <span className="text-lg font-bold text-primary">50+</span>
                </div>
                
                {/* Action Button */}
                <Button className="w-full" variant="outline" asChild>
                  <a href="/find-bin" className="flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                    <span className="mx-0.5">Find Locations</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-lg p-8 border border-gray-200">
                
                {/* Icon Container */}
                <div className="mb-6 relative">
                  <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Check Guidelines</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Review what we accept to ensure your donations help those who need them most.
                </p>
                
                {/* Quick Stats */}
                <div className="flex items-center justify-between mb-6 py-3 px-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Items Accepted</span>
                  <span className="text-lg font-bold text-green-600">15+</span>
                </div>
                
                {/* Action Button */}
                <Button className="w-full" variant="outline" asChild>
                  <a href="/what-to-donate" className="flex items-center justify-center">
                    <CheckCircle className="h-4 w-4" />
                    <span className="mx-0.5">View Guidelines</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-lg p-8 border border-gray-200">
                
                {/* Icon Container */}
                <div className="mb-6 relative">
                  <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-10 w-10 text-red-600" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Make Impact</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Drop off your donations and help families locally and globally with essential items.
                </p>
                
                {/* Quick Stats */}
                <div className="flex items-center justify-between mb-6 py-3 px-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Families Helped</span>
                  <span className="text-lg font-bold text-red-600">10K+</span>
                </div>
                
                {/* Action Button */}
                <Button className="w-full" variant="outline" asChild>
                  <a href="/our-story" className="flex items-center justify-center">
                    <Heart className="h-4 w-4" />
                    <span className="mx-0.5">See Our Impact</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-6 sm:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At H&H Donations, we believe that everyone deserves access to essential items and clothing. Our mission is to bridge the gap between those who have items to give and families who need them most.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We work directly with local shelters, community centers, and families to ensure donations reach those who need them most, creating a stronger, more supportive community for everyone.
              </p>
              <Button variant="outline" asChild>
                <a href="/our-story" className="flex items-center gap-0.5">
                  Read Our Full Story
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src="/images/Placeholder 2.jpg" 
                alt="H&H Donations volunteers organizing and sorting clothing donations for distribution to local families"
                loading="lazy"
                className="rounded-lg border border-gray-200 w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-black/5 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section - Redesigned with Tabs */}
      <section className="py-12 sm:py-16 lg:py-20 px-6 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who We Work With</h2>
            <p className="text-xl text-gray-600">Partnering with trusted organizations to maximize impact</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left side - Clickable tabs */}
            <div className="flex flex-col h-full">
              <div className="space-y-3 flex-1">
                {partners.map((partner, index) => (
                  <div
                    key={index}
                    onClick={() => setActivePartner(index)}
                    className={`cursor-pointer rounded-lg border transition-all ${
                      activePartner === index
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`rounded-lg p-3 flex-shrink-0 ${
                          activePartner === index ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {partner.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {partner.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {partner.description}
                          </p>
                          {activePartner === index && (
                            <p className="text-gray-700 text-sm mt-3">
                              {partner.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right side - Dynamic image */}
            <div className="relative h-full min-h-[400px]">
              <div className="relative rounded-lg overflow-hidden border border-gray-200 h-full">
                <img 
                  src={partners[activePartner].image}
                  alt={`H&H Donations partnership with ${partners[activePartner].title} - ${partners[activePartner].description}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-white font-semibold text-xl mb-2">
                    {partners[activePartner].title}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {partners[activePartner].details}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Can Be Donated */}
      <section className="py-12 sm:py-16 lg:py-20 px-6 sm:px-8 bg-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            <div className="relative h-full">
              <img 
                src="/images/Placeholder 3.jpg" 
                alt="Organized donated clothing, shoes, and household items ready for distribution through H&H Donations"
                loading="lazy"
                className="rounded-lg border border-gray-200 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/5 rounded-lg"></div>
            </div>
            
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What Can You Donate?</h2>
              <p className="text-xl text-gray-600 mb-8">
                We accept a wide variety of items to help families in need. Here are some examples:
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Clothing & Accessories</h3>
                    <p className="text-gray-600">Clean, gently used clothing for all ages and seasons, shoes, bags, and accessories.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Household Linens</h3>
                    <p className="text-gray-600">Bed sheets, blankets, towels, and other essential household textiles.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Children's Items</h3>
                    <p className="text-gray-600">Kids' clothing, baby items, and clean, safe accessories for children of all ages.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-primary/10 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3 text-gray-900">Want to Know More?</h3>
                <p className="text-gray-600 mb-4">
                  Get the complete list of accepted items, quality guidelines, and learn what items we cannot accept to ensure your donations make the biggest impact.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" asChild>
                    <a href="/what-to-donate" className="flex items-center gap-0.5">
                      View Complete Guidelines
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="/find-bin" className="flex items-center gap-0.5">
                      <MapPin className="h-4 w-4" />
                      Find Donation Bins
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Centered with Bottom Buttons */}
      <section className="py-12 sm:py-16 lg:py-20 px-6 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 to-green-50 border-primary/20">
            <CardContent className="p-12 text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Join thousands of community members who have already made an impact through H&H Donations. 
                Your contributions help families locally and globally.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">24/7 donation bins available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Free pickup for large donations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">Tax receipts available</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <a href="/find-bin" className="flex items-center gap-0.5">
                    <MapPin className="h-5 w-5" />
                    Find Donation Bins
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <a href="/request-pickup" className="flex items-center gap-0.5">
                    <Package className="h-5 w-5" />
                    Schedule a Pickup
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

        <Footer />
      </main>
    </>
  );
}

export default Dashboard;