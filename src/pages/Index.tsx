import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Utensils, GraduationCap, Stethoscope, Heart, ShieldCheck, Star, AlertTriangle, Instagram, Youtube, Shield, AlertCircle, Wheat, Milk, Fish, Egg, Pill, Users, Zap, Facebook, Linkedin, MessageSquare, Share2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import TreatmentModal from "@/components/TreatmentModal";
import NewsFeed from "@/components/NewsFeed";
import { MailerLiteSubscriptionForm } from "@/components/BrevoSubscriptionForm";
import AdvocacySpotlight from "@/components/AdvocacySpotlight";
import FoodAllergyInfographics from "@/components/FoodAllergyInfographics";
import AVLogo from "@/components/AVLogo";


const Index = () => {
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const treatments = [
    {
      id: 'oit',
      title: 'Oral Immunotherapy (OIT)',
      description: 'Gradual exposure therapy to build tolerance under medical supervision.',
      icon: Stethoscope,
      fdaStatus: 'Approved for peanut (Palforzia® ages 4–17); used off-label for milk, egg, etc.',
      effectiveness: '~60–80% of patients desensitized; raises threshold but not a cure.',
      allergens: 'Peanut (approved), Milk, Egg (off-label).',
      link: { url: 'https://www.fda.gov/vaccines-blood-biologics/allergenics/palforzia', text: 'FDA OIT Information' }
    },
    {
      id: 'patches',
      title: 'Patches (Epicutaneous)',
      description: 'Innovative patch-based treatment for gradual desensitization.',
      icon: Heart,
      fdaStatus: 'Not yet approved (Phase 3 trials).',
      effectiveness: '~35–50% of children desensitized vs ~10% placebo.',
      allergens: 'Peanut (primary), Milk (in trials).',
      link: { url: 'https://clinicaltrials.gov/ct2/show/NCT03211247', text: 'Viaskin Peanut Trials' }
    },
    {
      id: 'biologics',
      title: 'Biologics',
      description: 'Advanced treatments like Xolair and Dupilumab for severe allergies.',
      icon: ShieldCheck,
      fdaStatus: 'Xolair® approved 2024 for food allergy; Dupilumab still in trials.',
      effectiveness: '~65–70% reduced severe reactions vs <10% placebo.',
      allergens: 'Multiple foods (non-specific).',
      link: { url: 'https://www.fda.gov/news-events/press-announcements/fda-approves-first-medication-treat-multiple-food-allergies', text: 'FDA Xolair Approval' }
    },
    {
      id: 'emerging',
      title: 'Emerging Treatments',
      description: 'New and experimental therapies showing promise in research.',
      icon: Zap,
      fdaStatus: 'Various experimental treatments in different stages of research and trials.',
      effectiveness: 'Outcomes vary by treatment type; most are still investigational.',
      allergens: 'Multiple allergens depending on specific treatment.',
      additionalInfo: `
        <p class="mb-3"><strong>TIP (Tolerance Induction Program):</strong> Proprietary clinic-based program (not FDA-approved). Claims multi-allergen treatment; outcomes vary.</p>
        <p class="mb-3"><strong>Sublingual Immunotherapy (SLIT):</strong> Drops under tongue; partial desensitization, fewer severe reactions than OIT; still investigational.</p>
        <p class="mb-3"><strong>Probiotic + OIT (PPOIT):</strong> Small trial showed ~80% tolerance vs ~4% placebo; long-term results promising but not yet approved.</p>
        <p class="mb-3"><strong>Chinese Herbal Therapy (FAHF-2):</strong> Early studies showed safety but no strong benefit; still being studied.</p>
        <p><strong>Other Biologics (Dupilumab, IL-33 blockers, etc.):</strong> In trials; early results encouraging but not yet available.</p>
      `,
      link: { url: 'https://www.niaid.nih.gov/diseases-conditions/food-allergy-research', text: 'NIH Food Allergy Research' }
    }
  ];

  const openModal = (treatment: any) => {
    setSelectedTreatment(treatment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTreatment(null);
  };

  return (
    <div className="min-h-screen bg-background">
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
                Making life with food allergies safer, easier, and more inclusive.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="hero"
                  size="lg"
                  className="font-poppins text-base px-6 py-3"
                  onClick={() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Join the Community
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="font-poppins text-base px-6 py-3"
                  asChild
                >
                  <Link to="/restaurants">
                    Submit a Restaurant
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              {/* Food Allergy Infographics */}
              <FoodAllergyInfographics />
            </div>
          </div>
        </div>
      </section>

      {/* Advocacy Spotlight Section */}
      <AdvocacySpotlight />

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="font-inter text-lg leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Allergy Voices</span> amplifies the voices of families, teens, and adults managing allergies. 
            We simplify resources, highlight businesses that do it right, and advocate for safer, more inclusive food choices.
          </p>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-16 px-4 bg-background-subtle">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-6 text-foreground">
              Join Our Community
            </h2>
            <p className="font-inter text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with families, caregivers, teens, and adults who understand the daily challenges of living with food allergies. Together, we're stronger.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="rounded-2xl shadow-lg text-center">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl">Share Experiences</h3>
                <p className="font-inter text-muted-foreground">
                  Connect with others who truly understand the challenges
                </p>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl shadow-lg text-center">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl">Get Support</h3>
                <p className="font-inter text-muted-foreground">
                  Ask questions and receive guidance from experienced families
                </p>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl shadow-lg text-center">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-poppins font-semibold text-xl">Build Advocacy</h3>
                <p className="font-inter text-muted-foreground">
                  Work together to advocate for safer practices and policies
                </p>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl shadow-lg text-center">
              <CardContent className="p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Share2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-poppins font-semibold text-xl">Share Resources</h3>
                <p className="font-inter text-muted-foreground">
                  Discover and share safe products, restaurants, and tips
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Card className="rounded-2xl shadow-lg max-w-2xl mx-auto">
              <CardContent className="p-12">
                <h3 className="font-poppins font-bold text-3xl mb-6 text-foreground">
                  Ready to Connect?
                </h3>
                <p className="font-inter text-lg text-muted-foreground mb-8">
                  Join our newsletter to stay connected with the community and get updates on safe dining, treatments, and advocacy campaigns.
                </p>
                <Button 
                  size="lg" 
                  className="font-poppins"
                  onClick={() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Join the Community
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Everyday Living Section */}
      <section id="resources" className="py-16 px-4 bg-background-subtle">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-12 text-foreground">
            Everyday Living
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/safe-shopping">
              <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-foreground">Safe Shopping</h3>
                  <p className="font-inter text-muted-foreground">Navigate grocery stores with confidence and find allergy-friendly products.</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/dining-out">
              <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                    <Utensils className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-foreground">Dining Out</h3>
                  <p className="font-inter text-muted-foreground">Discover restaurants that understand and accommodate food allergies safely.</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/school-teens">
              <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                    <GraduationCap className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-foreground">School & Teens</h3>
                  <p className="font-inter text-muted-foreground">Resources for managing allergies in school settings and teen independence.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          {/* Treatments under Resources */}
          <div className="mt-16">
            <h3 className="font-poppins font-bold text-2xl text-center mb-8 text-foreground">
              Treatment Options
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {treatments.map((treatment) => {
                const IconComponent = treatment.icon;
                const colors = ['primary', 'secondary', 'accent', 'primary'];
                const colorClass = colors[treatments.indexOf(treatment) % colors.length];
                
                return (
                  <Card key={treatment.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-8 text-center space-y-4">
                      <div className={`w-16 h-16 rounded-full bg-${colorClass}/10 flex items-center justify-center mx-auto`}>
                        <IconComponent className={`w-8 h-8 text-${colorClass}`} />
                      </div>
                      <h4 className="font-poppins font-semibold text-lg text-foreground">
                        {treatment.title}
                      </h4>
                      <p className="font-inter text-sm text-muted-foreground">
                        {treatment.description}
                      </p>
                      <button
                        onClick={() => openModal(treatment)}
                        className="font-inter text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
                      >
                        Learn more
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* News & Updates Section */}
      <section id="news" className="py-16 px-4 bg-background-subtle">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-12 text-foreground">
            Latest News & Updates
          </h2>
          <NewsFeed />
        </div>
      </section>

      {/* Email Signup Section */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl mb-4 text-foreground">
            Be the First to Know
          </h2>
          <p className="font-inter text-lg text-muted-foreground mb-8">
            Get updates on safe dining, treatments, and advocacy campaigns.
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

      {/* Treatment Modal */}
      {selectedTreatment && (
        <TreatmentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          treatment={selectedTreatment}
        />
      )}
    </div>
  );
};

export default Index;