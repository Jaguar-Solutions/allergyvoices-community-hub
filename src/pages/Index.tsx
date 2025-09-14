import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Utensils, GraduationCap, Stethoscope, Heart, ShieldCheck, Star, AlertTriangle, Instagram, Youtube } from "lucide-react";
import Navigation from "@/components/Navigation";
import heroImage from "@/assets/hero-community.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background to-background-subtle pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="font-poppins font-bold text-5xl md:text-6xl leading-tight text-foreground">
                Every ingredient matters.{' '}
                <span className="text-primary">Every voice counts.</span>
              </h1>
              <p className="font-inter text-xl text-muted-foreground leading-relaxed">
                Making life with food allergies safer, easier, and more inclusive.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="hero" className="font-poppins">
                  Join the Community
                </Button>
                <Button variant="hero-secondary" size="hero" className="font-poppins">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="Diverse community sharing a safe meal together, representing food allergy awareness and inclusion"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="font-inter text-lg leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Allergy Voices</span> amplifies the voices of families, teens, and adults managing allergies. 
            We simplify resources, highlight businesses that do it right, and advocate for safer, more inclusive food choices.
          </p>
        </div>
      </section>

      {/* Everyday Living Section */}
      <section className="py-16 px-4 bg-background-subtle">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-12 text-foreground">
            Everyday Living
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground">Safe Shopping</h3>
                <p className="font-inter text-muted-foreground">Navigate grocery stores with confidence and find allergy-friendly products.</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                  <Utensils className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground">Dining Out</h3>
                <p className="font-inter text-muted-foreground">Discover restaurants that understand and accommodate food allergies safely.</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <GraduationCap className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-foreground">School & Teens</h3>
                <p className="font-inter text-muted-foreground">Resources for managing allergies in school settings and teen independence.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-12 text-foreground">
            Treatment Options
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Stethoscope className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-poppins font-semibold text-xl text-foreground">Oral Immunotherapy (OIT)</h3>
              <p className="font-inter text-muted-foreground">Gradual exposure therapy to build tolerance under medical supervision.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                <Heart className="w-10 h-10 text-secondary" />
              </div>
              <h3 className="font-poppins font-semibold text-xl text-foreground">Patches (Epicutaneous)</h3>
              <p className="font-inter text-muted-foreground">Innovative patch-based treatment for gradual desensitization.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10 text-accent" />
              </div>
              <h3 className="font-poppins font-semibold text-xl text-foreground">Biologics</h3>
              <p className="font-inter text-muted-foreground">Advanced treatments like Dupixent and Xolair for severe allergies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 px-4 bg-background-subtle">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-12 text-foreground">
            Community Highlights
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="w-6 h-6 text-secondary" />
                  <h3 className="font-poppins font-semibold text-xl text-foreground">Recognition Spotlight</h3>
                </div>
                <p className="font-inter text-muted-foreground mb-4">
                  <strong className="text-foreground">Restaurant of the Month:</strong> Green Garden Bistro
                </p>
                <p className="font-inter text-sm text-muted-foreground">
                  Exceptional allergy protocols, dedicated prep areas, and staff trained in cross-contamination prevention.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-lg bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-accent" />
                  <h3 className="font-poppins font-semibold text-xl text-foreground">Community Watch-Out</h3>
                </div>
                <p className="font-inter text-muted-foreground mb-4">
                  <strong className="text-foreground">Alert:</strong> Whole Foods Bakery Items
                </p>
                <p className="font-inter text-sm text-muted-foreground">
                  Several burger buns now contain sesame. Always check ingredient labels and ask staff about recent changes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-12 text-foreground">
            Latest Updates
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h4 className="font-poppins font-semibold text-lg text-foreground">FDA Approves New Peanut Treatment</h4>
              <p className="font-inter text-sm text-muted-foreground">Breakthrough therapy shows promise for children with severe peanut allergies.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-poppins font-semibold text-lg text-foreground">School Policy Updates</h4>
              <p className="font-inter text-sm text-muted-foreground">New guidelines for epinephrine administration in educational settings.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-poppins font-semibold text-lg text-foreground">Restaurant Chain Goes Allergy-Friendly</h4>
              <p className="font-inter text-sm text-muted-foreground">Major food chain implements comprehensive allergy safety protocols.</p>
            </div>
            <div className="space-y-3">
              <h4 className="font-poppins font-semibold text-lg text-foreground">Research Breakthrough</h4>
              <p className="font-inter text-sm text-muted-foreground">Scientists identify new pathway for preventing food allergic reactions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4 text-foreground">
            Be the First to Know
          </h2>
          <p className="font-inter text-lg text-muted-foreground mb-8">
            Get updates on safe dining, treatments, and advocacy campaigns.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 rounded-xl border-border font-inter"
              />
              <Button variant="hero" className="font-poppins">
                Subscribe
              </Button>
            </div>
            <p className="font-inter text-sm text-muted-foreground mt-4">
              <strong>Free bonus:</strong> Download our checklist "10 Questions to Ask Before Eating Out With Allergies"
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="font-poppins font-bold text-lg text-white">AV</span>
                </div>
                <h3 className="font-poppins font-bold text-2xl">Allergy Voices</h3>
              </div>
              <p className="font-inter text-background/80">
                Raising voices, changing menus.
              </p>
            </div>
            <div>
              <h4 className="font-poppins font-semibold text-lg mb-4">Quick Links</h4>
              <div className="space-y-2 font-inter">
                <a href="#" className="block hover:text-primary transition-colors">About</a>
                <a href="#" className="block hover:text-primary transition-colors">Resources</a>
                <a href="#" className="block hover:text-primary transition-colors">Contact</a>
                <a href="#" className="block hover:text-primary transition-colors">Privacy</a>
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
              </div>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center">
            <p className="font-inter text-background/60">
              © 2024 Allergy Voices. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;