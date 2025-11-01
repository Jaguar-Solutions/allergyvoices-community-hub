import React, { useState, useEffect } from 'react';
import { Building2, Users, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const FoodAllergyInfographics = () => {
  const [restaurantsTracked, setRestaurantsTracked] = useState(0);
  const [familiesJoined, setFamiliesJoined] = useState(0);
  const [policyUpdates, setPolicyUpdates] = useState(0);

  // Fetch metrics from Supabase
  useEffect(() => {
    const fetchMetrics = async () => {
      const { data, error } = await supabase
        .from('site_metrics')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        // Animate counters to the fetched values
        animateCounter(data.restaurants_tracked, setRestaurantsTracked);
        animateCounter(data.families_joined, setFamiliesJoined);
        animateCounter(data.policy_updates_tracked, setPolicyUpdates);
      }
    };

    fetchMetrics();
  }, []);

  // Animated counter effect
  const animateCounter = (target: number, setter: (value: number) => void) => {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setter(target);
        clearInterval(timer);
      } else {
        setter(Math.floor(current));
      }
    }, 20);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {/* Restaurants Tracked */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <div className="mb-2">
            <span className="text-4xl font-bold text-primary font-poppins">
              {restaurantsTracked}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">Allergy-Aware Restaurants</p>
        </CardContent>
      </Card>

      {/* Families Joined */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-secondary" />
          </div>
          <div className="mb-2">
            <span className="text-4xl font-bold text-secondary font-poppins">
              {familiesJoined.toLocaleString()}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">Families Connected</p>
        </CardContent>
      </Card>

      {/* Policy Updates */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-accent" />
          </div>
          <div className="mb-2">
            <span className="text-4xl font-bold text-accent font-poppins">
              {policyUpdates}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">Policy Updates Tracked</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodAllergyInfographics;