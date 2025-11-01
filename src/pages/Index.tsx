import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Users, Heart, Instagram, Youtube, Facebook, Linkedin, BookOpen, MessageCircle, Megaphone, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import FoodAllergyInfographics from "@/components/FoodAllergyInfographics";
import NewsFeed from "@/components/NewsFeed";
import AVLogo from "@/components/AVLogo";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


const Index = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Handle email signup
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Already subscribed",
            description: "This email is already on our list!",
          });
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        setEmail('');
        toast({
          title: "Thanks for joining!",
          description: "Welcome to the Allergy Voices community.",
        });
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Allergy Voices - Making Dining Safer for Everyone"
        description="Join thousands of families making dining safer for everyone. Access resources, connect with community, and advocate for safer food practices."
        keywords="food allergies, allergy-friendly restaurants, food allergy resources, safe dining, allergy community, policy advocacy"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background to-background-subtle pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground">
                Every ingredient matters.{' '}
                <span className="text-primary">Every voice counts.</span>
              </h1>
              <p className="font-inter text-lg md:text-xl text-muted-foreground leading-relaxed">
                Empowering families, amplifying voices, and driving change.
              </p>
              <Button
                size="lg"
                className="font-poppins text-base px-6 py-3"
                onClick={() => {
                  document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Join the Voices
              </Button>
            </div>
            <div className="relative">
              {/* Food Allergy Infographics */}
              <FoodAllergyInfographics />
            </div>
          </div>
        </div>
      </section>

      {/* Three Feature Cards: Learn / Connect / Advocate */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/safe-shopping">
              <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-poppins font-semibold text-2xl text-foreground">Learn</h3>
                  <p className="font-inter text-muted-foreground">
                    Practical resources for daily allergy life — shopping, dining, schools, and treatments.
                  </p>
                  <div className="pt-2">
                    <span className="text-primary text-sm font-medium flex items-center justify-center gap-1">
                      View Resources <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Card 
              className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full"
              onClick={() => {
                document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-poppins font-semibold text-2xl text-foreground">Connect</h3>
                <p className="font-inter text-muted-foreground">
                  Stories and experiences from families navigating food allergies together.
                </p>
                <div className="pt-2">
                  <span className="text-secondary text-sm font-medium flex items-center justify-center gap-1">
                    Join Community <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full"
              onClick={() => {
                document.getElementById('news')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <Megaphone className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-poppins font-semibold text-2xl text-foreground">Advocate</h3>
                <p className="font-inter text-muted-foreground">
                  Policy updates and how to take action for safer food practices.
                </p>
                <div className="pt-2">
                  <span className="text-accent text-sm font-medium flex items-center justify-center gap-1">
                    Get Involved <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Allergy News Section */}
      <section id="news" className="py-16 px-4 bg-background-subtle">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-12 text-foreground">
            Latest Allergy News
          </h2>
          
          <NewsFeed />
        </div>
      </section>

      {/* Email Signup CTA Banner */}
      <section id="signup" className="py-20 px-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4 text-foreground">
            Your story can make a difference.
          </h2>
          <p className="font-inter text-lg text-muted-foreground mb-8">
            Join thousands of families making dining safer for everyone.
          </p>
          
          {isSuccess ? (
            <div className="max-w-md mx-auto bg-card rounded-2xl p-8 shadow-lg border border-border">
              <div className="flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mx-auto mb-4">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-poppins font-semibold text-xl mb-2 text-foreground">
                Thanks for joining our community!
              </h3>
              <p className="font-inter text-muted-foreground mb-4">
                You'll receive updates on allergy-aware restaurants, policy changes, and resources.
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSuccess(false)}
                className="font-poppins"
              >
                Sign Up Another Email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEmailSignup} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 font-inter"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="font-poppins"
                >
                  {isSubmitting ? 'Joining...' : 'Join the Voices'}
                </Button>
              </div>
            </form>
          )}
          
          <div className="text-center mt-8">
            <p className="font-inter text-muted-foreground mb-2">
              Have questions or want to get in touch?
            </p>
            <a 
              href="mailto:info@allergyvoices.com" 
              className="font-inter text-primary hover:text-primary-hover font-semibold text-lg transition-colors"
            >
              info@allergyvoices.com
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-background-subtle">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-6 text-foreground">
            About Allergy Voices
          </h2>
          <p className="font-inter text-lg leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Allergy Voices</span> is a community-driven platform dedicated to making life with food allergies safer and more inclusive. 
            We amplify the voices of families, teens, and adults managing allergies by providing essential resources, highlighting allergy-aware businesses, and advocating for safer food practices. 
            Together, we're creating a world where everyone can dine with confidence.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <AVLogo size={40} className="text-primary-foreground" />
                <h3 className="font-poppins font-bold text-2xl">Allergy Voices</h3>
              </div>
              <p className="font-inter text-background/80 mb-4">
                Raising voices, changing menus.
              </p>
              <p className="font-inter text-sm text-background/60">
                Are you a restaurant? Learn how to become allergy-friendly.<br/>
                Email us at: restaurants@allergyvoices.com
              </p>
            </div>
            <div>
              <h4 className="font-poppins font-semibold text-lg mb-4">Quick Links</h4>
              <div className="space-y-2 font-inter">
                <Link to="/restaurants" className="block hover:text-primary transition-colors">Restaurants</Link>
                <a href="/#resources" className="block hover:text-primary transition-colors">Resources</a>
                <a href="/#news" className="block hover:text-primary transition-colors">News</a>
                <Link to="/about" className="block hover:text-primary transition-colors">About</Link>
              </div>
            </div>
            <div>
              <h4 className="font-poppins font-semibold text-lg mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-primary transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center">
            <p className="font-inter text-background/60">
              © 2025 Allergy Voices. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;