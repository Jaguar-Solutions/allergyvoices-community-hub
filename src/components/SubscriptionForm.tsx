import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

export const SubscriptionForm = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !firstName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      toast({
        title: "Verification required",
        description: "Please complete the reCAPTCHA verification.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Here you would typically make an API call to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSuccess(true);
      toast({
        title: "Successfully subscribed!",
        description: "Welcome to our community. Check your email for confirmation.",
      });
      
      // Reset form
      setEmail('');
      setFirstName('');
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

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-secondary" />
        </div>
        <h3 className="font-poppins font-semibold text-xl text-foreground">
          Welcome to the Community!
        </h3>
        <p className="text-muted-foreground">
          Check your email for a confirmation link and your free bonus checklist.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setIsSuccess(false)}
          className="mt-4"
        >
          Subscribe Another Email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="firstName" className="text-sm font-medium text-foreground">
          First Name *
        </Label>
        <Input
          id="firstName"
          type="text"
          placeholder="Enter your first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full"
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email Address *
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-center pt-2">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test site key - replace with your real key
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