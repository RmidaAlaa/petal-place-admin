import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageCircle,
  HelpCircle,
  Truck,
  Shield,
  HeadphonesIcon
} from 'lucide-react';
import { toast } from 'sonner';
import InteractiveMap from '@/components/InteractiveMap';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  category: string;
  message: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Thank you for your message! We will get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Visit Our Store',
      details: ['123 King Fahd Road', 'Riyadh, Saudi Arabia', 'Postal Code: 11564'],
      color: 'text-blue-600'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: 'Call Us',
      details: ['+966 50 123 4567', '+966 11 234 5678', 'Available 24/7'],
      color: 'text-green-600'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email Us',
      details: ['info@rosesgarden.com', 'support@rosesgarden.com', 'orders@rosesgarden.com'],
      color: 'text-purple-600'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Business Hours',
      details: ['Monday - Friday: 9:00 AM - 10:00 PM', 'Saturday: 10:00 AM - 11:00 PM', 'Sunday: 12:00 PM - 9:00 PM'],
      color: 'text-orange-600'
    }
  ];

  const faqItems: FAQItem[] = [
    {
      question: 'How do I place an order?',
      answer: 'You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. We accept various payment methods including credit cards, digital wallets, and cash on delivery.'
    },
    {
      question: 'What is your delivery policy?',
      answer: 'We offer same-day delivery within Riyadh for orders placed before 6 PM. Delivery to other cities takes 1-2 business days. All deliveries include real-time tracking and require signature upon receipt.'
    },
    {
      question: 'Do you offer custom bouquet arrangements?',
      answer: 'Yes! We specialize in custom arrangements. You can use our bouquet builder tool or contact our florists directly to create a personalized arrangement for your special occasion.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 100% satisfaction guarantee. If you are not completely satisfied with your order, please contact us within 24 hours and we will replace or refund your order.'
    },
    {
      question: 'Do you provide international delivery?',
      answer: 'Currently, we deliver within Saudi Arabia only. We are working on expanding our services to include international delivery in the near future.'
    },
    {
      question: 'How do I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via SMS and email. You can also track your order in real-time through your account dashboard.'
    }
  ];

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, name: 'Facebook', url: '#', color: 'hover:text-blue-600' },
    { icon: <Twitter className="h-5 w-5" />, name: 'Twitter', url: '#', color: 'hover:text-sky-500' },
    { icon: <Instagram className="h-5 w-5" />, name: 'Instagram', url: '#', color: 'hover:text-pink-600' },
    { icon: <Youtube className="h-5 w-5" />, name: 'YouTube', url: '#', color: 'hover:text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/20 to-cream">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're here to help! Get in touch with our team for any questions, concerns, or special requests.
            Our customer service team is available 24/7 to assist you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Get In Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`${info.color} mt-1`}>
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">{detail}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className={`p-2 rounded-full bg-muted hover:bg-primary hover:text-white transition-colors ${social.color}`}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Help */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span>Free delivery on orders over 200 SAR</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span>100% satisfaction guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HeadphonesIcon className="h-4 w-4 text-purple-600" />
                  <span>24/7 customer support</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="order">Order Related</SelectItem>
                          <SelectItem value="delivery">Delivery Question</SelectItem>
                          <SelectItem value="custom">Custom Order</SelectItem>
                          <SelectItem value="complaint">Complaint</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {faqItems.map((faq, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                  {index < faqItems.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Map Section */}
        <InteractiveMap />
      </div>
    </div>
  );
};

export default ContactUs;