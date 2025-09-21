import React from 'react';
import Navigation from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-8 text-foreground">
            About Allergy Voices
          </h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="font-inter text-lg text-muted-foreground mb-6">
              Allergy Voices was started by a parent of a child with food allergies who wanted to make life safer and more inclusive for all allergy sufferers and caregivers. What began as one family's search for safe dining and reliable information has grown into a community-driven advocacy effort.
            </p>
            
            <p className="font-inter text-lg text-muted-foreground mb-6">
              Our mission is simple: raise our voices so every menu, label, and decision considers people with food allergies.
            </p>
            
            <p className="font-inter text-lg text-muted-foreground mb-6">
              We believe change happens when we work together. That means sharing knowledge, supporting each other, and also campaigning to local governments and businesses. From asking restaurants to publish clear allergen listings to holding food companies accountable for recipe changes, we want to ensure people with food allergies are not left out of the decision-making process.
            </p>
            
            <p className="font-inter text-lg text-muted-foreground">
              At Allergy Voices, every story matters. Every caregiver, teen, and adult living with allergies has a voice that can drive change. Together, we can make dining, shopping, and living with allergies safer and more inclusive.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;