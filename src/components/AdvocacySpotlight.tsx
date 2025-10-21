import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Sparkles, AlertTriangle, ArrowRight } from "lucide-react";

const spotlightItems = [
  {
    id: 1,
    type: "good-news",
    badge: { icon: Sparkles, text: "Good News", variant: "default" as const },
    title: "Global Agencies Move Toward Clearer Allergen Labeling",
    content: [
      "In March 2025, the Food and Agriculture Organization (FAO) and World Health Organization (WHO) released a new science-based framework for allergen labeling. Rather than relying on vague \"may contain\" warnings, it promotes quantified thresholds and global consistency.",
      "While several European nations are already adopting these standards, the U.S. still lacks a unified approach — and families deserve better transparency."
    ]
  },
  {
    id: 2,
    type: "call-out",
    badge: { icon: AlertTriangle, text: "Call-Out", variant: "destructive" as const },
    title: "Label Confusion Still Affects Nearly Half of Allergy Consumers",
    content: [
      "A 2025 survey by the International Food Information Council (IFIC) found that 42% of people managing food allergies find packaged-food allergen labels unclear or confusing.",
      "Despite progress, inconsistent labeling continues to create uncertainty for families."
    ]
  },
  {
    id: 3,
    type: "call-out",
    badge: { icon: AlertTriangle, text: "Call-Out", variant: "destructive" as const },
    title: "Whole Foods' \"New Recipe\" Leaves Allergy Families Behind",
    content: [
      "Whole Foods recently added sesame to its popular hamburger and hot dog buns, removing one of the few safe options for families with sesame allergies.",
      "This highlights how recipe updates can unintentionally exclude allergy communities."
    ]
  }
];

export const AdvocacySpotlight = () => {
  return (
    <section className="py-12 px-4 bg-gradient-to-r from-accent/5 via-background to-accent/5">
      <div className="container mx-auto max-w-6xl">
        <h2 className="font-poppins font-bold text-3xl md:text-4xl text-center mb-8 text-foreground">
          Spotlight: Raising Voices, Changing Menus
        </h2>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {spotlightItems.map((item) => (
              <CarouselItem key={item.id} className="md:basis-full pl-2 md:pl-4 pt-4">
                <Card className={`rounded-2xl shadow-lg border-l-4 relative ${
                  item.type === "good-news" 
                    ? "border-l-primary" 
                    : "border-l-accent"
                }`}>
                  <CardContent className="p-6 md:p-8">
                    {/* Badge positioned at top */}
                    <div className="absolute -top-3 left-4">
                      <Badge 
                        variant={item.badge.variant}
                        className={`shadow-lg ${
                          item.type === "good-news" 
                            ? "bg-primary hover:bg-primary/90" 
                            : "bg-accent hover:bg-accent/90"
                        }`}
                      >
                        <item.badge.icon className="w-4 h-4 mr-1" />
                        {item.badge.text}
                      </Badge>
                    </div>
                    
                    <div className="mb-4 mt-2">
                      <h3 className="font-poppins font-bold text-xl md:text-2xl mb-3 text-foreground">
                        {item.title}
                      </h3>
                    </div>
                    
                    <div className="space-y-3 text-muted-foreground">
                      {item.content.map((paragraph, idx) => (
                        <p key={idx} className="font-inter leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
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
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-2 mt-6">
            <CarouselPrevious className="relative left-0 translate-x-0 translate-y-0" />
            <CarouselNext className="relative right-0 translate-x-0 translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default AdvocacySpotlight;