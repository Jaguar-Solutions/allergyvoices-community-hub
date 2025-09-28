import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ExternalLink, Shield } from "lucide-react";

interface RestaurantCardProps {
  restaurant: {
    id: string;
    restaurantName: string;
    city: string;
    cuisineType: string;
    website?: string;
    allergenMenuLink?: string;
    allergenFreeOptions: string[];
    grade: string;
    score: number;
    publishedAt: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
    state?: string;
  };
  onViewDetails: (restaurant: any) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onViewDetails }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Bronze': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Needs Improvement': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      case 'Bronze': return '🥉';
      case 'Needs Improvement': return '⚠️';
      default: return '⭐';
    }
  };

  const getGradeTooltip = (grade: string) => {
    switch (grade) {
      case 'Gold': return 'Gold = Excellent allergy practices and comprehensive training';
      case 'Silver': return 'Silver = Good allergy awareness and basic training';
      case 'Bronze': return 'Bronze = Basic allergy awareness and some accommodations';
      case 'Needs Improvement': return 'Needs Improvement = Limited allergy awareness';
      default: return 'Restaurant has been evaluated for allergy practices';
    }
  };

  const getCuisineIcon = (cuisine: string) => {
    switch (cuisine.toLowerCase()) {
      case 'italian': return '🍝';
      case 'mexican': return '🌮';
      case 'chinese': return '🍜';
      case 'indian': return '🍛';
      case 'american': return '🍔';
      case 'bakery': return '🥖';
      default: return '🍽️';
    }
  };

  const handleCardClick = () => {
    onViewDetails(restaurant);
  };

  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer border border-gray-200 bg-white"
      onClick={handleCardClick}
    >
      <CardContent className="p-5">
        {/* Header with Grade Badge */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-poppins font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              {restaurant.restaurantName}
            </h3>
          </div>
          <div className="flex-shrink-0">
            <Badge 
              className={`px-2 py-1 text-xs font-medium whitespace-nowrap ${getGradeColor(restaurant.grade)}`}
              title={getGradeTooltip(restaurant.grade)}
            >
              <span className="mr-1">{getGradeIcon(restaurant.grade)}</span>
              {restaurant.grade === 'Needs Improvement' ? 'Needs Work' : restaurant.grade}
            </Badge>
          </div>
        </div>

        {/* Location and Cuisine */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4" />
            <span>{restaurant.city}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>{getCuisineIcon(restaurant.cuisineType)}</span>
            <span>{restaurant.cuisineType}</span>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center space-x-2 mb-3">
          <Star className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            {restaurant.score} points
          </span>
        </div>

        {/* Allergen-Free Options */}
        {restaurant.allergenFreeOptions.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {restaurant.allergenFreeOptions.slice(0, 3).map(option => (
                <Badge 
                  key={option} 
                  variant="secondary" 
                  className="text-xs px-2 py-1 bg-primary/10 text-primary border-primary/20"
                >
                  {option}
                </Badge>
              ))}
              {restaurant.allergenFreeOptions.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  +{restaurant.allergenFreeOptions.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="space-y-2 mb-4">
          {restaurant.allergenMenuLink && (
            <div>
              <a
                href={restaurant.allergenMenuLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-sm text-primary hover:text-primary/80 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Shield className="w-3 h-3" />
                <span>Allergen Menu</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          {restaurant.website && (
            <div>
              <a
                href={restaurant.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-sm text-primary hover:text-primary/80 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3 h-3" />
                <span>Website</span>
              </a>
            </div>
          )}
        </div>

        {/* View Details Link */}
        <div className="pt-3 border-t border-gray-100">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(restaurant);
            }}
          >
            View Details →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
