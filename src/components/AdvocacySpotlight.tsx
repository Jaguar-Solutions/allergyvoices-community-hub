import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export const AdvocacySpotlight = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-accent/5 via-background to-accent/5">
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-12 text-foreground">
          Spotlight: Raising Voices, Changing Menus
        </h2>
        
        <Card className="rounded-2xl shadow-lg max-w-4xl mx-auto border-l-4 border-l-accent">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-start space-x-4 mb-6">
              <Badge variant="destructive" className="bg-accent hover:bg-accent/90">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Call-Out
              </Badge>
              <div className="flex-1">
                <h3 className="font-poppins font-bold text-2xl md:text-3xl mb-4 text-foreground">
                  Whole Foods' "New Recipe" Leaves Allergy Families Behind
                </h3>
              </div>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <p className="font-inter leading-relaxed">
                For years, Whole Foods stood out as one of the few national grocery stores where families with sesame allergies could reliably find safe hamburger and hot dog buns. Unfortunately, that changed with their recent recipe update — sesame has now been added to these breads.
              </p>
              
              <p className="font-inter leading-relaxed">
                This decision may have been easier for production, but it came at the expense of thousands of families who relied on these products. Once again, people with food allergies were left out of the decision-making process.
              </p>
              
              <p className="font-inter leading-relaxed">
                As advocates, we call on grocery stores and manufacturers to remember: allergens are not just ingredients — they are life-threatening for millions. Including sesame may simplify production, but it eliminates safe options for a vulnerable community.
              </p>
              
              <p className="font-inter leading-relaxed font-semibold text-foreground">
                Every recipe change should consider the impact on allergy families. We encourage Whole Foods to rethink this approach, and we urge other companies to lead with inclusion rather than convenience.
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border">
              <Button 
                variant="outline" 
                className="font-poppins"
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Join Our Advocacy Efforts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AdvocacySpotlight;