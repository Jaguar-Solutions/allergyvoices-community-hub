import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Users, Heart, Instagram, Youtube, Facebook, Linkedin } from "lucide-react";
import Navigation from "@/components/Navigation";
import NewsFeed from "@/components/NewsFeed";
import { MailerLiteSubscriptionForm } from "@/components/BrevoSubscriptionForm";
import AdvocacySpotlight from "@/components/AdvocacySpotlight";
import FoodAllergyInfographics from "@/components/FoodAllergyInfographics";
import AVLogo from "@/components/AVLogo";
import SEOHead from "@/components/SEOHead";


const Index = () => {
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
        <div className="container mx-auto max-w-6xl text-center">
          <div className="space-y-8">
            <div>
              <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground mb-6">
                Together, we make dining safer for everyone.
              </h1>
              <p className="font-inter text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-8">
                Empowering families, amplifying voices, and driving positive allergy change.
              </p>
              <Button
                size="lg"
                className="font-poppins text-base px-8 py-6"
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Join the Voices
              </Button>
            </div>
            
            {/* Metrics */}
            <div className="pt-8">
              <FoodAllergyInfographics />
            </div>
          </div>
        </div>
      </section>

      {/* Advocacy Spotlight Section */}
      <AdvocacySpotlight />

      {/* Three Feature Cards: Learn / Connect / Advocate */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-12 text-foreground">
            How We Help
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/safe-shopping">
              <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-poppins font-semibold text-2xl text-foreground">Learn</h3>
                  <p className="font-inter text-muted-foreground">
                    Access resources for safe shopping, dining out, school settings, and treatment options.
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Card 
              className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-poppins font-semibold text-2xl text-foreground">Connect</h3>
                <p className="font-inter text-muted-foreground">
                  Join a community of families who understand the challenges of food allergies.
                </p>
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
                  <Heart className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-poppins font-semibold text-2xl text-foreground">Advocate</h3>
                <p className="font-inter text-muted-foreground">
                  Stay informed on policy changes and join campaigns for safer food practices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* News & Updates Section */}
      <section id="news" className="py-16 px-4 bg-background-subtle">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-12 text-foreground">
            Latest Allergy News
          </h2>
          <NewsFeed />
        </div>
      </section>

      {/* Email Signup CTA Banner */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4 text-foreground">
            Your story can make a difference.
          </h2>
          <p className="font-inter text-lg text-muted-foreground mb-8">
            Join thousands of families making dining safer for everyone. Get updates on allergy-aware restaurants, policy changes, and resources.
          </p>
          <div className="max-w-lg mx-auto mb-8">
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
              <MailerLiteSubscriptionForm />
            </div>
          </div>
          <div className="text-center">
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