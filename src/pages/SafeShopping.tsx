import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Navigation from "@/components/Navigation";

const SafeShopping = () => {
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
              Safe Shopping with Food Allergies
            </h1>
            
            <p className="font-inter text-lg text-muted-foreground leading-relaxed mb-8">
              Shopping for groceries when you or a loved one has food allergies can feel overwhelming. Ingredient labels change often, and cross-contact warnings are inconsistent. Here are a few tips:
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Read labels every time</h3>
                <p className="font-inter text-muted-foreground">
                  Even for products you've bought before. Manufacturers can change ingredients without notice.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Look for "contains" statements</h3>
                <p className="font-inter text-muted-foreground">
                  U.S. law requires the top 9 allergens to be clearly labeled.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Know your safe brands</h3>
                <p className="font-inter text-muted-foreground">
                  Some companies, like Enjoy Life or MadeGood, are committed to allergy-friendly foods.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Be cautious with bakery items</h3>
                <p className="font-inter text-muted-foreground">
                  Store bakeries often have cross-contact risks with nuts, sesame, and dairy.
                </p>
              </div>
              
              <div className="bg-background-subtle p-6 rounded-lg">
                <h3 className="font-poppins font-semibold text-xl text-foreground mb-3">Stay updated</h3>
                <p className="font-inter text-muted-foreground">
                  Companies sometimes reformulate (like adding sesame to recipes). Joining advocacy groups helps you hear about changes quickly.
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
                    href="https://www.fda.gov/food/food-labeling-nutrition/food-allergen-labeling"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 font-inter text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>FDA – Food Allergen Labeling</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://kidswithfoodallergies.org/living-with-food-allergies/shopping-buying-food/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 font-inter text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>Kids With Food Allergies – Safe Shopping Tips</span>
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

export default SafeShopping;