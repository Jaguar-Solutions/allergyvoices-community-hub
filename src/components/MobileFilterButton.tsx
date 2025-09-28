import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

interface MobileFilterButtonProps {
  onClick: () => void;
  activeFiltersCount: number;
}

const MobileFilterButton: React.FC<MobileFilterButtonProps> = ({ 
  onClick, 
  activeFiltersCount 
}) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="w-full md:hidden flex items-center justify-center space-x-2"
    >
      <Filter className="w-4 h-4" />
      <span>Filters</span>
      {activeFiltersCount > 0 && (
        <Badge variant="secondary" className="ml-2">
          {activeFiltersCount}
        </Badge>
      )}
    </Button>
  );
};

export default MobileFilterButton;
