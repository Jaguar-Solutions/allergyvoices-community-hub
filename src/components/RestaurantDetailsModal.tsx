import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ExternalLink, Shield, Phone, Mail, Clock, CheckCircle } from "lucide-react";

interface RestaurantDetailsModalProps {
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
    // Additional details that might be available
    phone?: string;
    email?: string;
    contactPerson?: string;
    state?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const RestaurantDetailsModal: React.FC<RestaurantDetailsModalProps> = ({ 
  restaurant, 
  isOpen, 
  onClose 
}) => {
  if (!restaurant) return null;

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

  const getGradeDescription = (grade: string) => {
    switch (grade) {
      case 'Gold': return 'Excellent allergy practices and comprehensive training';
      case 'Silver': return 'Good allergy awareness and basic training';
      case 'Bronze': return 'Basic allergy awareness and some accommodations';
      case 'Needs Improvement': return 'Limited allergy awareness';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-poppins font-bold text-foreground mb-2">
                {restaurant.restaurantName}
              </DialogTitle>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurant.city}{restaurant.state && `, ${restaurant.state}`}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{getCuisineIcon(restaurant.cuisineType)}</span>
                  <span>{restaurant.cuisineType}</span>
                </div>
              </div>
            </div>
            <Badge 
              className={`px-3 py-1 text-sm font-medium ${getGradeColor(restaurant.grade)}`}
            >
              <span className="mr-1">{getGradeIcon(restaurant.grade)}</span>
              {restaurant.grade}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grade Description */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Allergy Safety Rating</h3>
            <p className="text-sm text-gray-600">{getGradeDescription(restaurant.grade)}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                {restaurant.score} points
              </span>
            </div>
          </div>

          {/* Allergen-Free Options */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Allergen-Free Options
            </h3>
            {restaurant.allergenFreeOptions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {restaurant.allergenFreeOptions.map(option => (
                  <Badge 
                    key={option} 
                    variant="secondary" 
                    className="px-3 py-1 bg-green-100 text-green-800 border-green-200"
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No specific allergen-free options listed</p>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
            <div className="space-y-2">
              {restaurant.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{restaurant.phone}</span>
                </div>
              )}
              {restaurant.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{restaurant.email}</span>
                </div>
              )}
              {restaurant.contactPerson && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Contact Person:</span>
                  <span className="text-sm">{restaurant.contactPerson}</span>
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Resources</h3>
            <div className="space-y-3">
              {restaurant.allergenMenuLink && (
                <div>
                  <a
                    href={restaurant.allergenMenuLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>View Allergen Menu</span>
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
                    className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit Website</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm text-blue-800 mb-2">Important Note</h3>
            <p className="text-sm text-blue-700">
              This restaurant has been evaluated by AllergyVoices for their allergy-friendly practices. 
              Always inform staff about your specific allergies when dining and ask about ingredients 
              and preparation methods.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantDetailsModal;
