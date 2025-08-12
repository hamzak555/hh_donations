import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, ArrowRight, CheckCircle, Building, Home, School, Heart } from 'lucide-react';
import Footer from '@/components/Footer';

function Dashboard() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-white pt-10 pb-20 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Making Donations 
            <span className="text-primary block">Simple & Accessible</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find donation bins in your community and make a lasting impact. Every donation helps families in need and strengthens our neighborhoods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <a href="/find-bin">
                <MapPin className="mr-2 h-5 w-5" />
                Find a Donation Bin
              </a>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
              <a href="/our-story">
                Learn Our Story
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
          
          {/* Hero Image Placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <img 
              src="/images/Placeholder 1.jpg" 
              alt="Community donation bins helping families"
              className="rounded-2xl shadow-2xl w-full h-[300px] md:h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to make a difference in your community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Find a Bin</h3>
              <p className="text-gray-600">Use our interactive map to locate donation bins near you. We have bins throughout the community for your convenience.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Check Guidelines</h3>
              <p className="text-gray-600">Review our donation guidelines to ensure your items are suitable and help us maintain quality for recipients.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Make Impact</h3>
              <p className="text-gray-600">Drop off your donations and know that you're directly helping families and individuals in your community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-8 bg-gray-50">
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
                <a href="/our-story">
                  Read Our Full Story
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src="/images/Placeholder 2.jpg" 
                alt="Volunteers organizing donations"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-black/5 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Who We Work With</h2>
          <p className="text-xl text-gray-600 mb-12">Partnering with trusted organizations to maximize impact</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-8 text-center">
                <Building className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Community Centers</h3>
                <p className="text-gray-600">Working with local community centers to serve families and individuals in need.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-8 text-center">
                <Home className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Local Shelters</h3>
                <p className="text-gray-600">Partnering with shelters to provide essential items to those experiencing homelessness.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-8 text-center">
                <School className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Schools & Programs</h3>
                <p className="text-gray-600">Supporting educational programs and helping students in need access essential supplies.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What Can Be Donated */}
      <section className="py-20 px-8 bg-primary/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="/images/Placeholder 3.jpg" 
                alt="Various donated items organized"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-black/5 rounded-2xl"></div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What Can Be Donated</h2>
              
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
                    <h3 className="font-semibold text-lg mb-1">Household Items</h3>
                    <p className="text-gray-600">Kitchen supplies, bedding, towels, small appliances, and home essentials.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Books & Educational Materials</h3>
                    <p className="text-gray-600">Books for all ages, educational materials, and learning resources.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Toys & Games</h3>
                    <p className="text-gray-600">Clean, safe toys, games, and recreational items for children of all ages.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Button asChild>
                  <a href="/what-to-donate">
                    View Complete Guidelines
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of community members who have already made an impact through H&H Donations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <a href="/find-bin">
                Find Donation Bins Near You
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Dashboard;