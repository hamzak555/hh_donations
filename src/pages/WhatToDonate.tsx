import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  MapPin,
  Truck,
  ArrowRight,
  Shirt,
  Home,
  Baby,
  BookOpen,
  Package,
  Sparkles,
  Footprints
} from 'lucide-react';
import Footer from '@/components/Footer';

const WhatToDonate = () => {
  const acceptableCategories = [
    {
      title: "Adult Clothing",
      icon: <Shirt className="h-8 w-8 text-primary" />,
      image: "/images/Placeholder 1.jpg",
      items: [
        "Men's clothing (all sizes)",
        "Women's clothing (all sizes)",
        "Coats and jackets",
        "Professional attire",
        "Seasonal clothing"
      ]
    },
    {
      title: "Children's Clothing",
      icon: <Baby className="h-8 w-8 text-primary" />,
      image: "/images/Placeholder 2.jpg",
      items: [
        "Baby clothes (0-24 months)",
        "Toddler clothing",
        "Kids' clothing (all sizes)",
        "Children's coats",
        "School uniforms"
      ]
    },
    {
      title: "Footwear & Accessories",
      icon: <Footprints className="h-8 w-8 text-primary" />,
      image: "/images/Placeholder 3.jpg",
      items: [
        "Shoes (all sizes)",
        "Boots and sneakers",
        "Belts and scarves",
        "Hats and gloves",
        "Handbags and purses"
      ]
    },
    {
      title: "Linens & Textiles",
      icon: <Home className="h-8 w-8 text-primary" />,
      image: "/images/Placeholder 4.jpg",
      items: [
        "Bed sheets and pillowcases",
        "Blankets and comforters",
        "Bath towels and washcloths",
        "Kitchen towels",
        "Curtains and drapes"
      ]
    }
  ];

  const donationJourney = [
    {
      number: "1",
      title: "Collection",
      description: "Your donations are collected from bins across the community"
    },
    {
      number: "2",
      title: "Sorting & Processing",
      description: "Items are sorted, packaged, and prepared for international shipping"
    },
    {
      number: "3",
      title: "Global Distribution",
      description: "Donations are shipped overseas to communities in need"
    },
    {
      number: "4",
      title: "Direct Impact",
      description: "Families receive clothing and essentials, improving their quality of life"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px] lg:min-h-[500px]">
          {/* Left Column - Text Content */}
          <div className="flex items-center py-10 lg:py-16 px-8">
            <div className="max-w-xl mx-auto lg:ml-auto lg:mr-12">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                What You Can
                <span className="text-primary block">Donate Today</span>
              </h1>
              <p className="text-sm sm:text-xl text-gray-600">
                Your donations directly support families in need. Every item makes a difference 
                in someone's life. Here's what we accept and how to prepare your donations.
              </p>
            </div>
          </div>

          {/* Right Column - Full Height Image */}
          <div className="relative h-[300px] lg:h-auto overflow-hidden rounded-l-2xl">
            <img 
              src="/images/Placeholder 5.jpg" 
              alt="People donating clothes"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
            
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
            
            {/* Floating badge */}
            <div className="absolute bottom-8 left-8 bg-white rounded-lg shadow-lg p-4 z-20">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">Every Item Counts</div>
                  <div className="text-sm text-gray-600">Making real impact daily</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Guidelines Section */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Donation Guidelines
            </h2>
            <p className="text-xl text-gray-600">
              Here's what we can and cannot accept to ensure quality donations
            </p>
          </div>

          {/* Items We Accept */}
          <div className="mb-16">
            <div className="space-y-8">
              {acceptableCategories.map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-primary/10 p-3 rounded-full">
                      {category.icon}
                    </div>
                    <h4 className="text-2xl font-semibold text-gray-900">{category.title}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items We Cannot Accept */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              ❌ Items We Cannot Accept
            </h3>
            <p className="text-sm sm:text-lg text-gray-600 text-center mb-6 sm:mb-8">
              For safety and quality reasons, we cannot accept these items
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-4 text-red-900">Household & Electronics</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Kitchen appliances and dishes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Electronics and computers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Books and media</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Furniture and home décor</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-4 text-red-900">Other Items</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Toys and games</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Baby equipment (cribs, strollers)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">School supplies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">Damaged or stained items</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quality Guidelines */}
          <div className="bg-primary/5 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Quality Matters
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              All items should be clean, gently used, and in good condition. This ensures 
              they can provide dignity and value to the families who receive them.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-8 bg-gradient-to-br from-primary/10 via-primary/5 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-sm sm:text-xl text-gray-600 mb-6 sm:mb-8">
            Choose the most convenient way to donate your items
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <MapPin className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Drop Off at a Bin</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Find the nearest bin and drop off your items 24/7
                </p>
                <Button className="w-full" asChild>
                  <Link to="/find-bin" className="flex items-center justify-center gap-0.5">
                    Find Nearest Bin
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <Truck className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Schedule a Pickup</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  We'll come to you for large donations
                </p>
                <Button className="w-full" asChild>
                  <Link to="/request-pickup" className="flex items-center justify-center gap-0.5">
                    Request Pickup
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-sm sm:text-base text-gray-600 mt-6 sm:mt-8">
            Have questions? <Link to="/contact" className="text-primary hover:underline">Contact us</Link> or 
            check our <Link to="/faq" className="text-primary hover:underline">FAQ</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhatToDonate;