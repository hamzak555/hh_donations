import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  Settings, 
  Shield, 
  Globe, 
  Users, 
  Lock,
  Sun,
  Wrench,
  Ruler,
  Car,
  Eye,
  Sparkles,
  Building,
  CheckCircle,
  ArrowRight,
  Heart,
  Wifi
} from 'lucide-react';
import Footer from '@/components/Footer';

const Partnerships = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Guaranteed Revenue",
      description: "$1,000 per year for each bin, paid in advance. No hidden fees or revenue sharing."
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Zero Operational Burden",
      description: "We handle installation, maintenance, collections, and cleaning. You just provide the space."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Professional & Secure",
      description: "High-quality bins with anti-theft mechanisms that enhance your property's appearance."
    },
    {
      icon: <Wifi className="h-6 w-6" />,
      title: "Smart Sensors for Cleanliness",
      description: "IoT sensors alert us before bins reach capacity, keeping your site clean and presentable."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Enhanced CSR Profile",
      description: "Demonstrate social responsibility. Perfect for corporate reports and marketing materials."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Increased Foot Traffic",
      description: "Regular visitors to your bins can increase exposure and create new customer opportunities."
    }
  ];

  const features = [
    {
      icon: <Wifi className="h-6 w-6" />,
      title: "Smart Sensor Technology",
      description: "Built-in sensors monitor fill levels in real-time, ensuring bins are emptied before reaching capacity",
      image: "/images/Placeholder 4.jpg",
      details: "Our advanced IoT sensors send automatic alerts when bins reach 80% capacity, ensuring timely collection and preventing overflow."
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Brightly Branded & Bilingual",
      description: "Eye-catching design with clear multilingual instructions",
      image: "/images/Placeholder 5.jpg",
      details: "High-visibility branding with instructions in English and French helps donors easily identify and use our bins."
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Safety-Engineered Construction",
      description: "Secure design prevents unauthorized access",
      image: "/images/Placeholder 6.jpg",
      details: "Anti-theft mechanisms and tamper-proof locks ensure donations remain secure until our scheduled collection."
    },
    {
      icon: <Sun className="h-6 w-6" />,
      title: "Weather-Resistant Exterior",
      description: "Built to withstand all weather conditions",
      image: "/images/Placeholder 7.jpg",
      details: "Durable, weatherproof materials protect donations from rain, snow, and extreme temperatures year-round."
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      title: "Ongoing Maintenance & Support",
      description: "Regular cleaning and upkeep included",
      image: "/images/Placeholder 8.jpg",
      details: "Monthly deep cleaning and immediate response to any maintenance needs keep bins looking professional."
    }
  ];

  const requirements = [
    {
      icon: <Ruler className="h-6 w-6" />,
      title: "Small Space",
      description: "Approx. 3' x 3' flat outdoor space"
    },
    {
      icon: <Car className="h-6 w-6" />,
      title: "Safe Access",
      description: "Pull-up zone for quick drop-offs"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Good Visibility",
      description: "Visible location to encourage donations"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Similar to Our Story */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px] lg:min-h-[500px]">
          {/* Left Column - Text Content */}
          <div className="flex items-center py-10 lg:py-16 px-8">
            <div className="max-w-xl mx-auto lg:ml-auto lg:mr-12">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Partner With Us for
                <span className="text-primary block">Community Impact</span>
              </h1>
              <p className="text-sm sm:text-xl text-gray-600 mb-6 sm:mb-8">
                Empowering communities through convenient and responsible clothing donation drop-offs. 
                Join our network of location partners and make a difference while earning guaranteed revenue.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <a href="/partner-application" className="flex items-center gap-0.5">
                    <Building className="h-5 w-5" />
                    Become a Partner
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Full Height Image */}
          <div className="relative h-[300px] lg:h-auto overflow-hidden rounded-l-2xl">
            <img 
              src="/images/Placeholder 3.jpg" 
              alt="Partnership opportunity"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
            
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Partnership Benefits
            </h2>
            <p className="text-sm sm:text-lg text-gray-600">
              Everything you need, nothing you don't
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border border-gray-200 h-full group hover:border-primary/50 transition-all duration-300 hover:shadow-lg cursor-pointer relative overflow-hidden">
                <CardContent className="p-6 h-full relative">
                  <div className="flex items-center gap-4 group-hover:opacity-0 transition-opacity duration-300">
                    <div className="bg-primary/10 p-3 rounded-lg text-primary">
                      {benefit.icon}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {benefit.title}
                    </h3>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary/90 flex items-center justify-center p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm leading-relaxed text-center">
                      {benefit.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bin Features Section - Redesigned with Tabs */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Smart, Professional Donation Bins
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-3xl mx-auto">
              Our bins feature advanced technology and professional design to ensure a seamless donation experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left side - Clickable tabs */}
            <div className="flex flex-col h-full">
              <div className="space-y-3 flex-1">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`cursor-pointer rounded-lg border transition-all ${
                      activeFeature === index
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`rounded-lg p-3 flex-shrink-0 ${
                          activeFeature === index ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {feature.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {feature.description}
                          </p>
                          {activeFeature === index && (
                            <p className="text-gray-700 text-sm mt-3">
                              {feature.details}
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
            <div className="relative h-full min-h-[600px]">
              <div className="relative rounded-lg overflow-hidden border border-gray-200 h-full">
                <img 
                  src={features[activeFeature].image}
                  alt={features[activeFeature].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <h3 className="text-white font-semibold text-xl mb-2">
                    {features[activeFeature].title}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {features[activeFeature].details}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple Requirements
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
              To ensure a successful and safe donation experience, we ask partners to provide a small, 
              accessible outdoor space with good visibility and easy donor access.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {requirements.map((req, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="bg-gradient-to-br from-primary/10 to-green-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <div className="text-primary">
                      {req.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900 mb-2">
                    {req.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    {req.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits to Location Section - CTA Style */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 to-green-50 border-primary/20">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="bg-primary/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Benefits To Your Location
              </h2>
              <p className="text-sm sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
                Transform your property into a community hub for positive change. We handle everything from 
                installation to maintenance – your only job is to provide the space.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">$1,000/year guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">Zero operational burden</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700 text-sm sm:text-base">Professional maintenance</span>
                </div>
              </div>
              
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <a href="/partner-application" className="flex items-center gap-0.5">
                  <Building className="h-5 w-5" />
                  Become a Partner
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partnerships;