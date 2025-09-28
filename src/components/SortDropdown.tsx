import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SortDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onValueChange }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">Sort by</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Sort restaurants" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="highest-rated">Highest Rated</SelectItem>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="city">City (A-Z)</SelectItem>
          <SelectItem value="name">Name (A-Z)</SelectItem>
          <SelectItem value="cuisine">Cuisine Type</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortDropdown;
