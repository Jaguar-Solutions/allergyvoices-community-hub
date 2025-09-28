import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";

export const AdvocacySpotlight = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-r from-accent/5 via-background to-accent/5">
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-8 text-foreground">
          Spotlight: Raising Voices, Changing Menus
        </h2>
        
        <Card className="rounded-2xl shadow-lg max-w-4xl mx-auto border-l-4 border-l-accent relative">
          <CardContent className="p-6 md:p-8">
            {/* Call-out badge positioned at top of border */}
            <div className="absolute -top-3 left-4">
              <Badge variant="destructive" className="bg-accent hover:bg-accent/90 shadow-lg">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Call-Out
              </Badge>
            </div>
            
            <div className="mb-4">
              <h3 className="font-poppins font-bold text-xl md:text-2xl mb-3 text-foreground">
                Whole Foods' "New Recipe" Leaves Allergy Families Behind
              </h3>
            </div>
            
            <div className="space-y-3 text-muted-foreground">
              <p className="font-inter leading-relaxed">
                For years, Whole Foods stood out as one of the few national grocery stores where families with sesame allergies could reliably find safe hamburger and hot dog buns. Unfortunately, that changed with their recent recipe update — sesame has now been added to these breads.
              </p>
              
              <p className="font-inter leading-relaxed">
                This decision may have been easier for production, but it came at the expense of thousands of families who relied on these products. Once again, people with food allergies were left out of the decision-making process.
              </p>
              
              <p className="font-inter leading-relaxed font-semibold text-foreground">
                Every recipe change should consider the impact on allergy families. We encourage Whole Foods to rethink this approach, and we urge other companies to lead with inclusion rather than convenience.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                className="font-poppins group"
                onClick={() => {
                  // TODO: Link to dedicated Spotlight page when created
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Read More
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AdvocacySpotlight;