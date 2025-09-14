import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Navigation from "@/components/Navigation";

const SchoolTeens = () => {
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
              School & Teens
            </h1>
            
            <p className="font-inter text-lg text-muted-foreground leading-relaxed mb-8">
              Managing food allergies at school is about teamwork: parents, students, and staff all play a role. In the U.S., many families create a 504 Plan to outline accommodations like safe meals, emergency procedures, and classroom policies. Teens also need support as they take more responsibility for their health and independence.
            </p>
            
            <div className="space-y-4">
              <h3 className="font-poppins font-semibold text-xl text-foreground mb-4">
                Helpful Resources
              </h3>
              
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://www.foodallergy.org/resources/back-school"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 font-inter text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>FARE – School Resources</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://kidswithfoodallergies.org/living-with-food-allergies/managing-food-allergies-at-school/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 font-inter text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>Kids With Food Allergies – School Planning</span>
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

export default SchoolTeens;