import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail } from 'lucide-react';

export const BrevoSubscriptionForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      const response = await fetch('https://0d57fd3a.sibforms.com/serve/MUIFAEUJZ2CVMblTePr5z5yBGiSdo98RX0hzDgdahWOUJbzJEmeA1MRLo83sY7sXvvCRKmiQaidhhnwfpmkQQOnPCl1o3jvfufQNo2MJl-JIZvWdJnhnYxR9wiLLiHZ_h0WzTxc46IBeMJ7XmCT0mNJ4Fz6yCAMHEbuHAOe7OTTWP386Jfo67yBUqVeEbxuRY4UmmvYQg2r-Cul1', {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      });

      toast({
        title: "Successfully subscribed!",
        description: "Welcome to our community. Check your email for confirmation.",
      });
      
      // Reset form
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Hidden fields required by Brevo */}
      <input type="hidden" name="email_address_check" value="" />
      <input type="hidden" name="locale" value="en" />
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email Address *
        </Label>
        <Input
          id="email"
          name="EMAIL"
          type="email"
          placeholder="Enter your email address"
          className="w-full"
          disabled={isLoading}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Subscribing...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4 mr-2" />
            Get My Free Checklist
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground text-center">
        By subscribing, you agree to receive our newsletter and promotional emails. 
        You can unsubscribe at any time.
      </p>
    </form>
  );
};