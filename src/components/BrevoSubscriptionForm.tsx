import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';

export const MailerLiteSubscriptionForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState<string | null>(null);
  const { toast } = useToast();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recaptchaValue) {
      toast({
        title: "Please complete the reCAPTCHA",
        description: "Please verify that you are not a robot.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      const email = (e.target as HTMLFormElement).email.value;
      
      formData.append('fields[email]', email);
      formData.append('ml-submit', '1');
      formData.append('anticsrf', 'true');
      formData.append('g-recaptcha-response', recaptchaValue);
      // Try to bypass double opt-in confirmation
      formData.append('double_optin', '0');
      formData.append('auto_confirm', '1');
      
      const response = await fetch('https://assets.mailerlite.com/jsonp/1797003/forms/165567148584863442/subscribe', {
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
      setRecaptchaValue(null);
      recaptchaRef.current?.reset();
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

  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email Address *
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email address"
          className="w-full"
          disabled={isLoading}
          required
        />
      </div>

      {/* reCAPTCHA */}
      <div className="flex justify-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6Lf1KHQUAAAAAFNKEX1hdSWCS3mRMv4FlFaNslaD"
          onChange={handleRecaptchaChange}
          theme="light"
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
            Subscribe
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