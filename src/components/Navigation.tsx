import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoImage from "@/assets/allergy-voices-logo.png";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if we're in dev mode - only show dev items when explicitly enabled
  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Base navigation items
  const baseNavItems = [
    { name: 'Home', href: '/' },
    { name: 'Restaurants', href: '/restaurants' },
    { name: 'Resources', href: '/#resources' },
    { name: 'News', href: '/#news' },
    { name: 'About', href: '/about' },
  ];

  // Add dev-only items
  const devNavItems = [
    { name: 'Directory (Dev)', href: '/restaurant-directory' },
  ];

  // Combine nav items based on dev mode
  const navItems = isDevMode 
    ? [...baseNavItems, ...devNavItems]
    : baseNavItems;

  const handleHashNavigation = (href: string) => {
    if (href.startsWith('/#')) {
      const hash = href.substring(2); // Remove '/#'
      if (window.location.pathname === '/') {
        // Already on home page, scroll to section
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Navigate to home page with hash
        window.location.href = href;
      }
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/90 backdrop-blur-md shadow-lg border-b border-border/20' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src={logoImage} 
              alt="Allergy Voices Logo" 
              className="w-12 h-12"
            />
            <span className="font-poppins font-bold text-xl text-foreground">
              Allergy Voices
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => {
            const isHashLink = item.href.startsWith('/#');
            return isHashLink ? (
              <button
                key={item.name}
                onClick={() => handleHashNavigation(item.href)}
                className="font-inter text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item.name}
              </button>
            ) : (
              <Link
                key={item.name}
                to={item.href}
                className="font-inter text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item.name}
              </Link>
            );
          })}
            <Button 
              variant="hero" 
              size="sm" 
              className="font-poppins"
              onClick={() => handleHashNavigation('/#contact')}
            >
              Join Community
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/20 bg-background/95 backdrop-blur-md">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => {
                const isHashLink = item.href.startsWith('/#');
                return isHashLink ? (
                  <button
                    key={item.name}
                    onClick={() => {
                      handleHashNavigation(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className="font-inter text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 text-left"
                  >
                    {item.name}
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="font-inter text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                );
              })}
              <div className="px-4 pt-2">
                <Button 
                  variant="hero" 
                  size="sm" 
                  className="font-poppins w-full"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleHashNavigation('/#contact');
                  }}
                >
                  Join Community
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;