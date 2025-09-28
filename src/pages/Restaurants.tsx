import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { TrendingUp, Award, Megaphone, Users } from "lucide-react";
import RestaurantSubmissionForm from "@/components/RestaurantSubmissionForm";

const Restaurants = () => {
  const scrollToForm = () => {
    document.getElementById('submission-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-6">
              Pilot Program
            </Badge>
            
            <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-6 text-foreground">
              Put Your Restaurant on the Allergy-Friendly Map
            </h1>
            
            <p className="font-inter text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Join our pilot program in the Triangle and be among the first to earn the AllergyVoices Approved™ badge.
            </p>
            
            <Button 
              size="lg" 
              className="font-poppins"
              onClick={scrollToForm}
            >
              Submit Your Restaurant
            </Button>
          </div>
        </section>

        {/* Benefits + Pilot Section (Condensed) */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl">Reach More Customers</h3>
                <p className="font-inter text-muted-foreground">
                  33 million Americans live with food allergies, and families are actively searching for safe places to eat.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl">Earn Trust</h3>
                <p className="font-inter text-muted-foreground">
                  Show your commitment with the AllergyVoices Approved™ badge that families recognize and trust.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <Megaphone className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-poppins font-semibold text-xl">Get Featured</h3>
                <p className="font-inter text-muted-foreground">
                  Our campaigns and directory will highlight approved restaurants in North Carolina and nationwide.
                </p>
              </div>
            </div>
            
            {/* Pilot Context Text */}
            <div className="text-center mb-8">
              <p className="font-inter text-lg text-muted-foreground max-w-4xl mx-auto">
                We're starting in North Carolina's Triangle area (Raleigh, Cary, Durham, Chapel Hill) as our pilot region. 
                But restaurants nationwide are welcome to submit now. Applications will be reviewed as we expand, with the full rollout beginning in 2026. 
                Early submissions will be prioritized for review and showcasing.
              </p>
            </div>
            
            {/* AllergyVoices Approved Badge */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-48 h-48 flex items-center justify-center">
                <img 
                  src={`/badge.png?v=${Date.now()}`}
                  alt="AllergyVoices Approved Badge" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="font-inter text-sm text-muted-foreground max-w-md text-center">
                Restaurants that meet our review standards will receive this AllergyVoices Approved™ certification.
              </p>
            </div>
          </div>
        </section>

        {/* Submission Form Section */}
        <section id="submission-form" className="py-16 px-4 bg-muted/20">
          <div className="container mx-auto max-w-4xl">
            <RestaurantSubmissionForm />
          </div>
        </section>

        {/* Community Note */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary mr-2" />
              <span className="font-poppins font-semibold text-lg text-foreground">Help Spread the Word</span>
            </div>
            <p className="font-inter text-muted-foreground">
              Not a restaurant owner? Help us spread the word — share this with your favorite local restaurant.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AV</span>
                </div>
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
                <a href="/#resources" className="block hover:text-primary transition-colors">Resources</a>
                <a href="/#news" className="block hover:text-primary transition-colors">News</a>
                <a href="/about" className="block hover:text-primary transition-colors">About</a>
              </div>
            </div>
            <div>
              <h4 className="font-poppins font-semibold text-lg mb-4">Contact</h4>
              <div className="space-y-2 font-inter">
                <p className="text-background/80">info@allergyvoices.com</p>
                <p className="text-background/80">restaurants@allergyvoices.com</p>
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

export default Restaurants;