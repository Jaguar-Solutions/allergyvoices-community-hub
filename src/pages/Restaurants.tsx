import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { Users, Star, Shield, Clock } from "lucide-react";

const Restaurants = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            Coming Soon
          </Badge>
          
          <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-8 text-foreground">
            Restaurants
          </h1>
          
          <p className="font-inter text-xl text-muted-foreground mb-12">
            We're building something exciting: an Allergy-Friendly Restaurant Guide.
          </p>
          
          <Card className="rounded-2xl shadow-lg mb-12 text-left">
            <CardContent className="p-8">
              <h2 className="font-poppins font-semibold text-2xl mb-6 text-foreground">
                More than reviews — a grading system that matters
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg">Staff Training</h3>
                  <p className="font-inter text-sm text-muted-foreground">
                    Restaurants that properly train their staff on allergen protocols
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg">Cross-Contact Prevention</h3>
                  <p className="font-inter text-sm text-muted-foreground">
                    Proper kitchen protocols to prevent allergen cross-contamination
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg">Clear Information</h3>
                  <p className="font-inter text-sm text-muted-foreground">
                    Transparent allergen information and menu labeling
                  </p>
                </div>
              </div>
              
              <p className="font-inter text-muted-foreground mb-6">
                We're currently designing the grading criteria and gathering input from both allergy families and restaurant partners.
              </p>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Button 
              size="lg" 
              className="font-poppins"
              onClick={() => {
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Users className="w-5 h-5 mr-2" />
              Join the Community
            </Button>
            
            <p className="font-inter text-muted-foreground">
              Want to help shape it? Join our community and share your feedback.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Restaurants;