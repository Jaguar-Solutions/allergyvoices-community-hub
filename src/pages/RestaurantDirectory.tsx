import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Search, Filter, ExternalLink, Shield, Users, MapPin, RefreshCw } from "lucide-react";
import { getPublishedRestaurants } from '@/lib/supabase';

interface PublishedRestaurant {
  id: string;
  restaurantName: string;
  city: string;
  cuisineType: string;
  website: string;
  allergenMenuLink?: string;
  allergenFreeOptions: string[];
  grade: string;
  score: number;
  publishedAt: string;
}

const RestaurantDirectory = () => {
  const [restaurants, setRestaurants] = useState<PublishedRestaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<PublishedRestaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [cuisineFilter, setCuisineFilter] = useState<string>('all');
  const [allergenFilter, setAllergenFilter] = useState<string>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const cities = ['Raleigh', 'Cary', 'Durham', 'Chapel Hill'];
  const cuisineTypes = ['American', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Bakery'];
  const allergenOptions = [
    'Peanut-Free', 'Tree-Nut-Free', 'Egg-Free', 'Dairy-Free', 
    'Gluten-Free', 'Sesame-Free', 'Soy-Free', 'Shellfish-Free'
  ];

  // Load published restaurants from Supabase
  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
        const result = await getPublishedRestaurants();
        if (import.meta.env.DEV) {
          console.log('🔍 getPublishedRestaurants result:', result);
          console.log('🔍 result.success:', result.success);
          console.log('🔍 result.data length:', result.data?.length);
        }
        
        if (result.success && result.data) {
          if (import.meta.env.DEV) {
            console.log('📊 Raw restaurant data:', result.data);
            console.log('📊 First restaurant:', result.data[0]);
          }
          // Transform Supabase data to match our interface
          const transformedRestaurants: PublishedRestaurant[] = result.data.map((restaurant: any) => {
            const questionnaire = restaurant.restaurant_questionnaires?.[0];
            const responses = questionnaire?.responses || {};
            const rating = restaurant.restaurant_ratings?.[0];
            
            return {
              id: restaurant.id,
              restaurantName: restaurant.name,
              city: restaurant.city,
              cuisineType: responses.cuisineType || 'Unknown',
              website: responses.website || '',
              allergenMenuLink: responses.allergenMenuLink || '',
              allergenFreeOptions: responses.allergenFreeOptions || [],
              grade: responses.grade || 'Needs Improvement',
              score: responses.score || 0,
              publishedAt: restaurant.submitted_at
            };
          });
          
          setRestaurants(transformedRestaurants);
          setFilteredRestaurants(transformedRestaurants);
          if (import.meta.env.DEV) {
            console.log('✅ Loaded published restaurants from Supabase:', transformedRestaurants.length);
          }
        } else {
          console.error('❌ Failed to load restaurants:', result.error);
          // Fallback to empty array
          setRestaurants([]);
          setFilteredRestaurants([]);
        }
      } catch (error) {
        console.error('❌ Error loading restaurants:', error);
        setRestaurants([]);
        setFilteredRestaurants([]);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    loadRestaurants();
  }, []);

  // Filter restaurants
  useEffect(() => {
    let filtered = restaurants;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisineType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // City filter
    if (cityFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.city === cityFilter);
    }

    // Cuisine filter
    if (cuisineFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.cuisineType === cuisineFilter);
    }

    // Allergen filter
    if (allergenFilter !== 'all') {
      filtered = filtered.filter(restaurant => 
        restaurant.allergenFreeOptions.includes(allergenFilter)
      );
    }

    // Grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.grade === gradeFilter);
    }

    setFilteredRestaurants(filtered);
  }, [restaurants, searchTerm, cityFilter, cuisineFilter, allergenFilter, gradeFilter]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Gold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Silver': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Bronze': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'Gold': return '🥇';
      case 'Silver': return '🥈';
      case 'Bronze': return '🥉';
      default: return '⭐';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background to-background-subtle pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <h1 className="font-poppins font-bold text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground">
              Allergy-Friendly Restaurant Directory
            </h1>
            <p className="font-inter text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Discover restaurants in the Triangle that prioritize food allergy safety. 
              Each restaurant has been evaluated and graded based on their allergy-friendly practices.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Verified Allergy Practices</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Community Reviewed</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Triangle Area Focus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search restaurants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={cityFilter} onValueChange={setCityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cuisine</Label>
                  <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All cuisines" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cuisines</SelectItem>
                      {cuisineTypes.map(cuisine => (
                        <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Allergen-Free</Label>
                  <Select value={allergenFilter} onValueChange={setAllergenFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All options" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Options</SelectItem>
                      {allergenOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-muted-foreground">
                  {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={loadRestaurants}
                    disabled={isLoading}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setCityFilter('all');
                      setCuisineFilter('all');
                      setAllergenFilter('all');
                      setGradeFilter('all');
                    }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Restaurant Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-poppins font-bold text-xl text-foreground mb-2">No restaurants found</h3>
                    <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <Card key={restaurant.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-poppins font-bold text-xl text-foreground">
                            {restaurant.restaurantName}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <span className="text-lg">{getGradeIcon(restaurant.grade)}</span>
                            <Badge className={`px-2 py-1 text-xs ${getGradeColor(restaurant.grade)}`}>
                              {restaurant.grade}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{restaurant.city}</span>
                          </div>
                          <span>•</span>
                          <span>{restaurant.cuisineType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{restaurant.score} points</span>
                        </div>
                      </div>

                      {/* Allergen-Free Options */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Allergen-Free Options</Label>
                        <div className="flex flex-wrap gap-2">
                          {restaurant.allergenFreeOptions.map(option => (
                            <Badge key={option} variant="secondary" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Links */}
                      <div className="space-y-2">
                        {restaurant.allergenMenuLink && (
                          <div>
                            <a
                              href={restaurant.allergenMenuLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 text-sm text-primary hover:underline"
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
                              className="inline-flex items-center space-x-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Visit Website</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-8">
                <h3 className="font-poppins font-bold text-2xl text-foreground mb-4">
                  Don't see your favorite restaurant?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Help us expand our directory by submitting information about restaurants that prioritize food allergy safety.
                </p>
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="font-poppins"
                  onClick={() => window.location.href = '/restaurant-submission'}
                >
                  Submit a Restaurant
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RestaurantDirectory;
