import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";

interface FilterSidebarProps {
  // Filter states
  selectedCities: string[];
  selectedCuisines: string[];
  selectedAllergens: string[];
  gradeFilter: string;
  
  // Filter options
  cities: string[];
  cuisineTypes: string[];
  allergenOptions: string[];
  
  // Count functions
  getCityCount: (city: string) => number;
  getCuisineCount: (cuisine: string) => number;
  getAllergenCount: (allergen: string) => number;
  
  // Handlers
  onCityToggle: (city: string) => void;
  onCuisineToggle: (cuisine: string) => void;
  onAllergenToggle: (allergen: string) => void;
  onGradeChange: (grade: string) => void;
  onClearAll: () => void;
  
  // Mobile props
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCities,
  selectedCuisines,
  selectedAllergens,
  gradeFilter,
  cities,
  cuisineTypes,
  allergenOptions,
  getCityCount,
  getCuisineCount,
  getAllergenCount,
  onCityToggle,
  onCuisineToggle,
  onAllergenToggle,
  onGradeChange,
  onClearAll,
  isMobile = false,
  isOpen = false,
  onClose
}) => {
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-poppins font-semibold text-lg">Filters</h3>
        {isMobile && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* City Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">City</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {cities.map(city => {
            const count = getCityCount(city);
            const isSelected = selectedCities.includes(city);
            return (
              <div key={city} className="flex items-center space-x-2">
                <Checkbox
                  id={`city-${city}`}
                  checked={isSelected}
                  onCheckedChange={() => onCityToggle(city)}
                />
                <Label 
                  htmlFor={`city-${city}`} 
                  className="text-sm cursor-pointer flex-1 flex justify-between items-center"
                >
                  <span className={count === 0 ? 'text-muted-foreground' : ''}>{city}</span>
                  {count > 0 ? (
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">(0)</span>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cuisine Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Cuisine Type</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {cuisineTypes.map(cuisine => {
            const count = getCuisineCount(cuisine);
            const isSelected = selectedCuisines.includes(cuisine);
            return (
              <div key={cuisine} className="flex items-center space-x-2">
                <Checkbox
                  id={`cuisine-${cuisine}`}
                  checked={isSelected}
                  onCheckedChange={() => onCuisineToggle(cuisine)}
                />
                <Label 
                  htmlFor={`cuisine-${cuisine}`} 
                  className="text-sm cursor-pointer flex-1 flex justify-between items-center"
                >
                  <span className={count === 0 ? 'text-muted-foreground' : ''}>{cuisine}</span>
                  {count > 0 ? (
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">(0)</span>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Allergen Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Allergen-Free Options</Label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {allergenOptions.map(allergen => {
            const count = getAllergenCount(allergen);
            const isSelected = selectedAllergens.includes(allergen);
            return (
              <div key={allergen} className="flex items-center space-x-2">
                <Checkbox
                  id={`allergen-${allergen}`}
                  checked={isSelected}
                  onCheckedChange={() => onAllergenToggle(allergen)}
                />
                <Label 
                  htmlFor={`allergen-${allergen}`} 
                  className="text-sm cursor-pointer flex-1 flex justify-between items-center"
                >
                  <span className={count === 0 ? 'text-muted-foreground' : ''}>{allergen}</span>
                  {count > 0 ? (
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">(0)</span>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grade Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Grade</Label>
        <Select value={gradeFilter} onValueChange={onGradeChange}>
          <SelectTrigger>
            <SelectValue placeholder="All grades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Silver">Silver</SelectItem>
            <SelectItem value="Bronze">Bronze</SelectItem>
            <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear All Button */}
      <div className="pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={onClearAll}
          className="w-full"
        >
          <Filter className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
        )}
        
        {/* Mobile Drawer */}
        <div className={`fixed top-0 right-0 h-full w-80 bg-background z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <Card className="h-full rounded-none border-0 shadow-xl">
            <CardContent className="p-6 h-full overflow-y-auto">
              <FilterContent />
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Desktop Sidebar
  return (
    <Card className="h-fit sticky top-6">
      <CardContent className="p-6">
        <FilterContent />
      </CardContent>
    </Card>
  );
};

export default FilterSidebar;
