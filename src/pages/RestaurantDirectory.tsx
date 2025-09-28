import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Search, RefreshCw, Shield, Users, MapPin, Filter } from "lucide-react";
import { getPublishedRestaurants } from '@/lib/supabase';
import RestaurantCard from '@/components/RestaurantCard';
import FilterSidebar from '@/components/FilterSidebar';
import MobileFilterButton from '@/components/MobileFilterButton';
import SortDropdown from '@/components/SortDropdown';
import RestaurantDetailsModal from '@/components/RestaurantDetailsModal';

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
  phone?: string;
  email?: string;
  contactPerson?: string;
  state?: string;
}

const RestaurantDirectory = () => {
  // Data state
  const [restaurants, setRestaurants] = useState<PublishedRestaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<PublishedRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('highest-rated');

  // Mobile state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // Modal state
  const [selectedRestaurant, setSelectedRestaurant] = useState<PublishedRestaurant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter options
  const cities = ['Raleigh', 'Cary', 'Durham', 'Chapel Hill'];
  const cuisineTypes = ['American', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Bakery'];
  const allergenOptions = [
    'Peanut-Free', 'Tree-Nut-Free', 'Egg-Free', 'Dairy-Free', 
    'Gluten-Free', 'Sesame-Free', 'Soy-Free', 'Shellfish-Free'
  ];

  // Helper functions to get counts
  const getCityCount = (city: string) => {
    return restaurants.filter(restaurant => restaurant.city === city).length;
  };

  const getCuisineCount = (cuisine: string) => {
    return restaurants.filter(restaurant => restaurant.cuisineType === cuisine).length;
  };

  const getAllergenCount = (allergen: string) => {
    return restaurants.filter(restaurant => 
      restaurant.allergenFreeOptions.includes(allergen)
    ).length;
  };

  // Helper functions for handling selections
  const handleCityToggle = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city) 
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const handleCuisineToggle = (cuisine: string) => {
    setSelectedCuisines(prev => 
      prev.includes(cuisine) 
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleAllergenToggle = (allergen: string) => {
    setSelectedAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCities([]);
    setSelectedCuisines([]);
    setSelectedAllergens([]);
    setGradeFilter('all');
  };

  // Modal handlers
  const handleViewDetails = (restaurant: PublishedRestaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
  };

  // Sort function
  const sortRestaurants = (restaurants: PublishedRestaurant[], sortBy: string) => {
    const sorted = [...restaurants];
    
    switch (sortBy) {
      case 'highest-rated':
        return sorted.sort((a, b) => b.score - a.score);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
      case 'city':
        return sorted.sort((a, b) => a.city.localeCompare(b.city));
      case 'name':
        return sorted.sort((a, b) => a.restaurantName.localeCompare(b.restaurantName));
      case 'cuisine':
        return sorted.sort((a, b) => a.cuisineType.localeCompare(b.cuisineType));
      default:
        return sorted;
    }
  };

  // Load published restaurants from Supabase
  const loadRestaurants = async () => {
    setIsLoading(true);
    try {
      const result = await getPublishedRestaurants();
      if (import.meta.env.DEV) {
        console.log('🔍 getPublishedRestaurants result:', result);
      }
      
      if (result.success && result.data) {
        if (import.meta.env.DEV) {
          console.log('📊 Raw restaurant data:', result.data);
        }
        // Transform Supabase data to match our interface
        const transformedRestaurants: PublishedRestaurant[] = result.data.map((restaurant: any) => {
          const questionnaire = restaurant.restaurant_questionnaires?.[0];
          const responses = questionnaire?.responses || {};
          const rating = restaurant.restaurant_ratings?.[0];

          // Debug logging to see what's in the responses
          if (import.meta.env.DEV) {
            console.log('Restaurant responses:', responses);
          }

          return {
            id: restaurant.id,
            restaurantName: restaurant.name,
            city: restaurant.city,
            state: restaurant.state,
            cuisineType: responses.cuisine_type || responses.cuisineType || 'American',
            website: responses.website || '',
            allergenMenuLink: responses.allergen_menu_link || responses.allergenMenuLink || '',
            allergenFreeOptions: responses.allergen_free_options || responses.allergenFreeOptions || [],
            grade: responses.grade || 'Needs Improvement',
            score: responses.score || 0,
            publishedAt: restaurant.submitted_at || new Date().toISOString(),
            phone: responses.phone || '',
            email: responses.email || '',
            contactPerson: responses.contact_person || responses.contactPerson || ''
          };
        });
        
        setRestaurants(transformedRestaurants);
        setFilteredRestaurants(transformedRestaurants);
        if (import.meta.env.DEV) {
          console.log('✅ Loaded published restaurants from Supabase:', transformedRestaurants.length);
        }
      } else {
        console.error('❌ Failed to load restaurants:', result.error);
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

  // Load restaurants on mount
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Filter and sort restaurants
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

    // City filter (multiple selection)
    if (selectedCities.length > 0) {
      filtered = filtered.filter(restaurant => selectedCities.includes(restaurant.city));
    }

    // Cuisine filter (multiple selection)
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(restaurant => selectedCuisines.includes(restaurant.cuisineType));
    }

    // Allergen filter (multiple selection)
    if (selectedAllergens.length > 0) {
      filtered = filtered.filter(restaurant => 
        selectedAllergens.some(allergen => restaurant.allergenFreeOptions.includes(allergen))
      );
    }

    // Grade filter
    if (gradeFilter !== 'all') {
      filtered = filtered.filter(restaurant => restaurant.grade === gradeFilter);
    }

    // Sort results
    const sorted = sortRestaurants(filtered, sortBy);
    setFilteredRestaurants(sorted);
  }, [restaurants, searchTerm, selectedCities, selectedCuisines, selectedAllergens, gradeFilter, sortBy]);

  // Calculate active filters count
  const activeFiltersCount = selectedCities.length + selectedCuisines.length + selectedAllergens.length + (gradeFilter !== 'all' ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background to-background-subtle pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
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

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-80 flex-shrink-0">
              <FilterSidebar
                selectedCities={selectedCities}
                selectedCuisines={selectedCuisines}
                selectedAllergens={selectedAllergens}
                gradeFilter={gradeFilter}
                cities={cities}
                cuisineTypes={cuisineTypes}
                allergenOptions={allergenOptions}
                getCityCount={getCityCount}
                getCuisineCount={getCuisineCount}
                getAllergenCount={getAllergenCount}
                onCityToggle={handleCityToggle}
                onCuisineToggle={handleCuisineToggle}
                onAllergenToggle={handleAllergenToggle}
                onGradeChange={setGradeFilter}
                onClearAll={clearAllFilters}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* Search and Controls */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="space-y-2">
                      <Label htmlFor="search">Search Restaurants</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="search"
                          placeholder="Search by name, city, or cuisine..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Mobile Filter Button */}
                    <MobileFilterButton
                      onClick={() => setIsMobileFilterOpen(true)}
                      activeFiltersCount={activeFiltersCount}
                    />

                    {/* Desktop Controls */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <SortDropdown value={sortBy} onValueChange={setSortBy} />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          onClick={loadRestaurants}
                          disabled={isLoading}
                          className="flex items-center space-x-2"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                          <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-poppins font-semibold text-xl">
                  {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
                </h2>
                <div className="hidden md:block">
                  <SortDropdown value={sortBy} onValueChange={setSortBy} />
                </div>
              </div>

              {/* Restaurant Grid */}
              {filteredRestaurants.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-poppins font-bold text-xl text-foreground mb-2">No restaurants found</h3>
                    <p className="text-muted-foreground mb-6">
                      Try adjusting your search criteria or filters to find more restaurants.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard 
                      key={restaurant.id} 
                      restaurant={restaurant} 
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}

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
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      <FilterSidebar
        isMobile={true}
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        selectedCities={selectedCities}
        selectedCuisines={selectedCuisines}
        selectedAllergens={selectedAllergens}
        gradeFilter={gradeFilter}
        cities={cities}
        cuisineTypes={cuisineTypes}
        allergenOptions={allergenOptions}
        getCityCount={getCityCount}
        getCuisineCount={getCuisineCount}
        getAllergenCount={getAllergenCount}
        onCityToggle={handleCityToggle}
        onCuisineToggle={handleCuisineToggle}
        onAllergenToggle={handleAllergenToggle}
        onGradeChange={setGradeFilter}
        onClearAll={clearAllFilters}
      />

      {/* Restaurant Details Modal */}
      <RestaurantDetailsModal
        restaurant={selectedRestaurant}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default RestaurantDirectory;