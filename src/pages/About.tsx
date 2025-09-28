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
              Allergy Voices began with one family's struggle to find safe places to eat with their child who has food allergies. What started as a personal search for clarity has grown into a community-driven effort to make life safer, easier, and more inclusive for all allergy sufferers and caregivers.
            </p>
            
            <p className="font-inter text-lg text-muted-foreground mb-6">
              Our mission is simple: raise our voices so every menu, label, and decision considers people with food allergies.
            </p>
            
            <p className="font-inter text-lg text-muted-foreground mb-6">
              We believe real change happens when we work together. That means:
            </p>
            
            <ul className="font-inter text-lg text-muted-foreground mb-6 ml-6 space-y-2">
              <li>• Sharing knowledge and stories.</li>
              <li>• Supporting each other as families and caregivers.</li>
              <li>• Encouraging restaurants and businesses to be allergy-friendly.</li>
              <li>• Advocating at the state and national level for stronger transparency and allergy safety laws.</li>
            </ul>
            
            <p className="font-inter text-lg text-muted-foreground mb-6">
              At Allergy Voices, we're more than a directory — we're a movement. From asking restaurants to publish clear allergen listings, to holding food companies accountable for recipe changes, to pushing for mandatory allergy-friendly practices, we aim to ensure no one with food allergies is left out of the decision-making process.
            </p>
            
            <p className="font-inter text-lg text-muted-foreground mb-6">
              This initiative belongs to the community. Every caregiver, teen, adult, and ally has a voice that can drive change. Your stories, suggestions, and participation are not just welcome — they are what make Allergy Voices possible.
            </p>
            
            <p className="font-inter text-lg text-muted-foreground">
              Together, we can make dining, shopping, and living with food allergies safer and more inclusive for everyone.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
};

export default About;