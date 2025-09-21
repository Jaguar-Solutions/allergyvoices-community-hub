import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Navigation from "@/components/Navigation";

const DiningOut = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-inter text-sm">Back to Everyday Living</span>
          </Link>
          
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8 md:p-12">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl text-foreground mb-6">
              Dining Out with Confidence
            </h1>
            
            <p className="font-inter text-lg text-muted-foreground leading-relaxed mb-8">
              Eating at restaurants can be one of the hardest parts of living with food allergies. A few strategies can help make it safer:
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Call ahead</h3>
                <p className="font-inter text-muted-foreground">
                  Ask about allergy protocols before you go.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Speak directly with the manager or chef</h3>
                <p className="font-inter text-muted-foreground">
                  They're usually best positioned to answer honestly.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Ask about cross-contact</h3>
                <p className="font-inter text-muted-foreground">
                  Especially fryers, grills, and shared utensils.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Use a chef card</h3>
                <p className="font-inter text-muted-foreground">
                  A printed card listing your allergies can reduce misunderstandings.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Support allergy-friendly restaurants</h3>
                <p className="font-inter text-muted-foreground">
                  When you find one that takes allergies seriously, go back and thank them. Positive reinforcement makes a difference.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                Helpful Resources
              </h3>
              
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://www.foodallergy.org/resources/dining-out"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 font-inter text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>FARE – Dining Out With Food Allergies</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.allergyeats.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 font-inter text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>AllergyEats – Find Allergy-Friendly Restaurants</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiningOut;