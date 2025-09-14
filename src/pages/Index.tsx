import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShoppingBag, Utensils, GraduationCap, Stethoscope, Heart, ShieldCheck, Star, AlertTriangle, Instagram, Youtube, Shield, AlertCircle, Wheat, Milk, Fish, Egg, Pill, Users, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import TreatmentModal from "@/components/TreatmentModal";

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
              {/* Food Allergy Icons Display */}
              <div className="relative p-8 rounded-2xl bg-gradient-to-br from-background to-background-subtle border border-border/20 shadow-xl">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-center justify-center">
                  {/* Main Alert Icon */}
                  <div className="col-span-2 md:col-span-3 flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-accent/30 flex items-center justify-center">
                        <Shield className="w-12 h-12 text-accent" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Common Allergen Icons */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center relative">
                      <Wheat className="w-8 h-8 text-primary" />
                      <div className="absolute inset-0 rounded-full border-2 border-destructive opacity-70"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-0.5 bg-destructive rotate-45"></div>
                      </div>
                    </div>
                    <span className="text-xs font-inter text-muted-foreground">Gluten</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center relative">
                      <div className="w-6 h-6 rounded-full bg-secondary"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-destructive opacity-70"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-0.5 bg-destructive rotate-45"></div>
                      </div>
                    </div>
                    <span className="text-xs font-inter text-muted-foreground">Nuts</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center relative">
                      <Milk className="w-8 h-8 text-accent" />
                      <div className="absolute inset-0 rounded-full border-2 border-destructive opacity-70"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-0.5 bg-destructive rotate-45"></div>
                      </div>
                    </div>
                    <span className="text-xs font-inter text-muted-foreground">Dairy</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center relative">
                      <Egg className="w-8 h-8 text-primary" />
                      <div className="absolute inset-0 rounded-full border-2 border-destructive opacity-70"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-0.5 bg-destructive rotate-45"></div>
                      </div>
                    </div>
                    <span className="text-xs font-inter text-muted-foreground">Eggs</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center relative">
                      <Fish className="w-8 h-8 text-secondary" />
                      <div className="absolute inset-0 rounded-full border-2 border-destructive opacity-70"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-0.5 bg-destructive rotate-45"></div>
                      </div>
                    </div>
                    <span className="text-xs font-inter text-muted-foreground">Seafood</span>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center relative">
                      <div className="w-6 h-6 rounded bg-accent"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-destructive opacity-70"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-0.5 bg-destructive rotate-45"></div>
                      </div>
                    </div>
                    <span className="text-xs font-inter text-muted-foreground">Sesame</span>
                  </div>
                </div>
                
                <div className="text-center mt-6">
                  <p className="font-inter text-sm text-muted-foreground">
                    Common food allergens requiring careful management
                  </p>
                </div>
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
      <section id="resources" className="py-16 px-4 bg-background-subtle">
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
      <section id="treatments" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-12 text-foreground">
            Treatment Options
          </h2>
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
                    <h3 className="font-poppins font-semibold text-lg text-foreground">
                      {treatment.title}
                    </h3>
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
      </section>

      {/* Highlights Section */}
      <section id="highlights" className="py-16 px-4 bg-background-subtle">
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
      <section id="about" className="py-16 px-4">
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
      <section id="contact" className="py-20 px-4 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
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
                <a href="#about" className="block hover:text-primary transition-colors">About</a>
                <a href="#resources" className="block hover:text-primary transition-colors">Resources</a>
                <a href="#contact" className="block hover:text-primary transition-colors">Contact</a>
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