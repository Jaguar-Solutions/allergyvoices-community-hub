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
              Navigating Food Allergies at School & Beyond
            </h1>
            
            <p className="font-inter text-lg text-muted-foreground leading-relaxed mb-8">
              Children and teens with food allergies need clear plans and support. Some steps to consider:
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Allergy Action Plan</h3>
                <p className="font-inter text-muted-foreground">
                  Provide schools with written emergency instructions from your doctor.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Communicate with teachers & staff</h3>
                <p className="font-inter text-muted-foreground">
                  Make sure everyone knows how to recognize symptoms and respond.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Pack safe snacks</h3>
                <p className="font-inter text-muted-foreground">
                  Especially for younger kids or when classroom celebrations involve food.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">For teens</h3>
                <p className="font-inter text-muted-foreground">
                  Encourage self-advocacy: carrying their own epinephrine, speaking up at restaurants, and staying cautious at social events.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Stay connected</h3>
                <p className="font-inter text-muted-foreground">
                  Many parents find joining a support group helps share resources and reduce isolation.
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