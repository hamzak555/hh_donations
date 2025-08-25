import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Globe, 
  Users, 
  TrendingUp,
  MapPin,
  Package,
  ArrowRight,
  Target,
  Eye,
  CheckCircle
} from 'lucide-react';
import Footer from '@/components/Footer';

const OurStory = () => {
  const milestones = [
    {
      year: "2018",
      title: "The Beginning",
      description: "Started with a single donation bin and a vision to help communities worldwide"
    },
    {
      year: "2020",
      title: "Expanding Reach",
      description: "Grew to 20 bins across the city, partnering with local businesses and organizations"
    },
    {
      year: "2022",
      title: "Global Impact",
      description: "Shipped our first international container, reaching families in 10 countries"
    },
    {
      year: "2024",
      title: "Community Strong",
      description: "Now operating 50+ bins and helping over 10,000 families annually"
    }
  ];

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Compassion",
      description: "Every donation is handled with care, knowing it will bring dignity to someone in need"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Global Reach",
      description: "Connecting local generosity with global needs, bridging communities across continents"
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Community",
      description: "Building stronger neighborhoods through the simple act of giving"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Sustainability",
      description: "Giving clothes a second life while reducing textile waste in our environment"
    }
  ];

  const stats = [
    { number: "10K+", label: "Families Helped" },
    { number: "30+", label: "Countries Reached" },
    { number: "50+", label: "Donation Bins" },
    { number: "100K+", label: "Items Donated" }
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
                Our Story of
                <span className="text-primary block">Global Impact</span>
              </h1>
              <p className="text-sm sm:text-xl text-gray-600">
                What started as a simple idea to help people in need abroad has grown into a movement 
                that connects communities across the globe. This is our journey of turning 
                everyday donations into life-changing support.
              </p>
            </div>
          </div>

          {/* Right Column - Full Height Image */}
          <div className="relative h-[300px] lg:h-auto overflow-hidden rounded-l-2xl">
            <img 
              src="/images/Placeholder 7.jpg" 
              alt="Community impact"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
            
            {/* Decorative elements */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
            
            {/* Floating badge */}
            <div className="absolute bottom-8 left-8 bg-white rounded-lg shadow-lg p-4 z-20">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">Community Driven</div>
                  <div className="text-sm text-gray-600">By locals, for the world</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-sm sm:text-lg text-gray-600">
                  To create a sustainable bridge between surplus and scarcity, collecting quality 
                  clothing donations from our community and delivering them to families in developing 
                  nations who need them most.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <Eye className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                <p className="text-sm sm:text-lg text-gray-600">
                  A world where no family lacks basic clothing necessities, where communities 
                  support each other across borders, and where giving is as easy as walking to 
                  your nearest donation bin.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* The Beginning */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It All Started
            </h2>
          </div>
          
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <p className="text-sm sm:text-lg text-gray-600 mb-6">
              In 2018, our founder witnessed firsthand the contrast between overflowing closets 
              in our neighborhoods and families struggling without basic clothing in developing 
              countries. In today's world of wars and economic hard ship, this stark reality sparked a simple question: 
              <span className="font-semibold text-gray-900"> "How can we connect those who have extra with those who have nothing?"</span>
            </p>
            
            <p className="text-sm sm:text-lg text-gray-600 mb-6">
              Starting with a single donation bin placed outside a local community center, 
              we began collecting gently used clothing. The response was overwhelming – 
              our community was eager to help, they just needed an easy way to do it.
            </p>
            
            <p className="text-sm sm:text-lg text-gray-600 mb-6">
              HH Donations is built on the personal contributions of its founders and the generosity 
              of our community. To sustain our mission and reach more people in underdeveloped countries, 
              we carefully resell a small portion of newer donated clothing, allowing us to fund 
              operations and expand our impact.
            </p>
            
            <p className="text-sm sm:text-lg text-gray-600">
              Today, H&H Donations operates over 50 bins across the city, partnering with 
              international aid organizations to ensure every donation reaches families who 
              need them most. What started as one person's vision has become a community 
              movement, proving that small acts of kindness can create global change.
            </p>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-sm sm:text-xl text-gray-600">
              From humble beginnings to global impact
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="bg-primary text-white text-xl font-bold py-2 px-4 rounded-lg mb-4">
                    {milestone.year}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{milestone.title}</h3>
                  <p className="text-gray-600 text-sm">{milestone.description}</p>
                </div>
                {index < milestones.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-primary/20"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-sm sm:text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact in Numbers
            </h2>
            <p className="text-sm sm:text-xl text-gray-600">
              The difference we've made together
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-primary/10 to-green-500/10 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Behind Every Number is a Story</h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto mb-6">
              Each donation represents a child attending school in proper clothing, a parent 
              interviewing for a job with dignity, a family staying warm through winter. 
              Your contributions don't just fill bins – they change lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/what-to-donate" className="flex items-center gap-0.5">
                  <Package className="h-5 w-5" />
                  See What to Donate
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/find-bin" className="flex items-center gap-0.5">
                  <MapPin className="h-5 w-5" />
                  Find a Donation Bin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default OurStory;