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
              Dining Out
            </h1>
            
            <p className="font-inter text-lg text-muted-foreground leading-relaxed mb-8">
              Eating at restaurants with food allergies takes preparation. Always communicate your allergy clearly to staff, ask about cross-contact, and consider carrying an allergy card. More restaurants are offering interactive allergy menus and safe dining practices — a trend that continues to grow.
            </p>
            
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