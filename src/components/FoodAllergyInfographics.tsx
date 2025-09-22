import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Users, Heart, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FoodAllergyInfographics = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [childrenCount, setChildrenCount] = useState(0);
  const [hospitalCount, setHospitalCount] = useState(0);

  // Animated counter effect
  useEffect(() => {
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

    const timer = setTimeout(() => {
      animateCounter(32, setTotalCount);
      animateCounter(5.6, setChildrenCount);
      animateCounter(200, setHospitalCount);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Growth trend data
  const growthData = [
    { year: '1997', prevalence: 3.4 },
    { year: '2002', prevalence: 4.1 },
    { year: '2007', prevalence: 4.8 },
    { year: '2012', prevalence: 5.2 },
    { year: '2017', prevalence: 5.8 },
    { year: '2024', prevalence: 7.6 }
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Left Column - Main Stats */}
      <div className="space-y-6">
        {/* Total Americans */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-primary font-poppins">
                    {totalCount}M
                  </span>
                  <span className="text-lg text-muted-foreground">Americans</span>
                </div>
                <p className="text-sm text-muted-foreground">Total with food allergies (~10%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children Affected */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-secondary font-poppins">
                    {childrenCount}M
                  </span>
                  <span className="text-lg text-muted-foreground">Children</span>
                </div>
                <p className="text-sm text-muted-foreground">1 in 13 kids affected</p>
              </div>
            </div>
            {/* Progress bar showing 1 in 13 */}
            <div className="w-full bg-secondary/10 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-secondary to-secondary/80 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(1/13) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Percentage of children with food allergies</p>
          </CardContent>
        </Card>

        {/* Hospital Visits */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-destructive font-poppins">
                    {hospitalCount}K
                  </span>
                  <span className="text-lg text-muted-foreground">ER Visits</span>
                </div>
                <p className="text-sm text-muted-foreground">Annual food allergy emergencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Growth Trend Chart */}
      <div className="h-full flex">
        {/* Growth Trend - Full Height */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 flex-1">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-poppins font-semibold text-xl text-foreground">Growing Trend</h3>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <XAxis dataKey="year" className="text-xs" />
                    <YAxis domain={[3, 8]} className="text-xs" />
                    <Line 
                      type="monotone" 
                      dataKey="prevalence" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      className="animate-fade-in"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground">Childhood prevalence (%)</p>
              <div className="text-right">
                <p className="text-lg font-bold text-primary font-poppins">+50%</p>
                <p className="text-xs text-muted-foreground">Since 1997</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoodAllergyInfographics;