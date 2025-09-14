import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  treatment: {
    title: string;
    fdaStatus: string;
    effectiveness: string;
    allergens: string;
    additionalInfo?: string;
    link: { url: string; text: string };
  };
}

const TreatmentModal: React.FC<TreatmentModalProps> = ({ isOpen, onClose, treatment }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-poppins font-bold text-2xl text-foreground">
              {treatment.title}
            </h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                FDA Status
              </h3>
              <p className="font-inter text-muted-foreground leading-relaxed">
                {treatment.fdaStatus}
              </p>
            </div>

            <div>
              <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                Effectiveness
              </h3>
              <p className="font-inter text-muted-foreground leading-relaxed">
                {treatment.effectiveness}
              </p>
            </div>

            <div>
              <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                Applicable Allergens
              </h3>
              <p className="font-inter text-muted-foreground leading-relaxed">
                {treatment.allergens}
              </p>
            </div>

            {treatment.additionalInfo && (
              <div>
                <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                  Additional Information
                </h3>
                <div className="font-inter text-muted-foreground leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: treatment.additionalInfo }} />
                </div>
              </div>
            )}

            {/* Learn More Link */}
            <div className="pt-4 border-t border-border">
              <a
                href={treatment.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 font-inter text-primary hover:text-primary/80 transition-colors"
              >
                <span>{treatment.link.text}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentModal;