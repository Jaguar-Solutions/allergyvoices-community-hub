import React from 'react';
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MessageSquare, Heart, Share2 } from "lucide-react";

const Community = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-6 text-foreground">
              Join Our Community
            </h1>
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
                <h2 className="font-poppins font-bold text-3xl mb-6 text-foreground">
                  Ready to Connect?
                </h2>
                <p className="font-inter text-lg text-muted-foreground mb-8">
                  Join our newsletter to stay connected with the community and get updates on safe dining, treatments, and advocacy campaigns.
                </p>
                <Button 
                  size="lg" 
                  className="font-poppins"
                  onClick={() => {
                    window.location.href = '/#contact';
                  }}
                >
                  Join the Community
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Community;