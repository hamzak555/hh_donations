import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="pt-16 pb-12 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked
            <span className="text-primary block">Questions</span>
          </h1>
          <p className="text-sm sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about donating with H&H Donations. Can't find what you're looking for? We're here to help!
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 px-8">
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                What items can I donate?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                We accept clean, gently used clothing for all ages, household items like kitchen supplies and bedding, books and educational materials, toys and games, shoes, bags, and accessories. All items should be in good condition and clean before donation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                What items should I NOT donate?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                Please do not donate items that are stained, torn, or damaged, undergarments, expired food or cosmetics, hazardous materials, large furniture, or electronics that don't work. We want to ensure all donated items are safe and useful for recipients.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                How do I find donation bins near me?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                Use our interactive map on the <a href="/find-bin" className="text-primary underline hover:no-underline">"Find a Bin"</a> page. Simply enter your location or allow location access, and we'll show you all nearby donation bins with addresses, hours, and specific guidelines for each location.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                Are the donation bins available 24/7?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                Most of our donation bins are accessible 24/7, but some locations may have specific hours based on where they're placed (such as shopping centers or community centers). Check the specific bin details on our map for exact availability hours.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                Do you provide pickup services for large donations?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                Yes! We offer pickup services for larger donations or when you have multiple items to donate. You can schedule a pickup through our <a href="/request-pickup" className="text-primary underline hover:no-underline">"Request Pickup"</a> page. Our team will contact you to arrange a convenient time and provide any specific guidelines.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                How do I know my donations are reaching people in need?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                We work directly with local shelters, community centers, schools, and families in need. All donations are sorted, quality-checked, and distributed through our network of trusted partner organizations to ensure they reach those who need them most.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                What should I do if a donation bin is full?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                Our bins are equipped with smart sensors that alert us when they're approaching capacity, so full bins are rare. If you do encounter one, please don't leave items outside as they may get damaged by weather. Instead, try another nearby location, schedule a pickup service, or contact us to report the issue.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                How often are donation bins emptied?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                Our bins feature advanced sensor technology that monitors fill levels in real-time. When a bin approaches capacity, our team is automatically notified and promptly dispatched to empty it. This smart system ensures bins are never overfilled and maintains cleanliness around donation sites.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                Can I volunteer with H&H Donations?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                Absolutely! We always welcome volunteers to help with sorting donations, organizing distribution events, and community outreach. Contact us through our website or visit our office to learn about current volunteer opportunities.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                Do you accept donations from businesses?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                Yes, we welcome corporate donations! Many businesses donate overstock items, office supplies, or sponsor community drives. Contact us directly to discuss bulk donations and we'll work with you to arrange suitable pickup or drop-off arrangements.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                What happens to donations that can't be distributed?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                Items that can't be distributed locally are sent to textile recycling facilities or partner organizations in other regions. We ensure nothing goes to waste - items that can't be reused are recycled responsibly whenever possible.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-13" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                How can I stay updated on H&H Donations activities?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                Follow us on social media for regular updates on distribution events, new bin locations, and community impact stories. You can also sign up for our newsletter through our website to receive monthly updates and volunteer opportunities.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-14" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                Is there a limit to how much I can donate?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                There's no limit to how much you can donate! For very large donations, we recommend scheduling a pickup service to ensure everything can be properly collected and processed. Our team can help coordinate large-scale donations.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-15" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                How can my business or property become a donation bin location?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                We're always looking for new location partners! By hosting a donation bin, you'll receive $1,000/year paid in advance, with zero operational burden - we handle everything including maintenance and collection. Our bins feature smart sensors to prevent overflow and maintain cleanliness. Visit our <a href="/partnerships" className="text-primary underline hover:no-underline">Partnerships page</a> to learn more and apply.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-16" className="border border-gray-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-lg py-6 hover:no-underline">
                How can I contact H&H Donations for other questions?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-gray-600 pb-6">
                You can reach us through our website contact form, call our main office, or email us directly. We typically respond within 24-48 hours. For urgent bin issues or pickup scheduling, calling is usually the fastest option.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pt-8 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 sm:p-16 text-center">
              <div className="bg-primary/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
              <p className="text-sm sm:text-xl text-gray-600 mb-6 sm:mb-8">
                Our team is here to help! Don't hesitate to reach out if you need more information or have specific questions about donating.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <a href="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                  <a href="/request-pickup">
                    Request Pickup
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6" asChild>
                  <a href="/find-bin">
                    Find Donation Bins
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default FAQ;