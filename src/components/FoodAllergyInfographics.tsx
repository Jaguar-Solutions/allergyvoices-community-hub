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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto">
      {/* Left Column - Main Stats */}
      <div className="space-y-3 lg:space-y-4">
        {/* Total Americans */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline space-x-1 flex-wrap">
                  <span className="text-xl lg:text-2xl font-bold text-primary font-poppins">
                    {totalCount}M
                  </span>
                  <span className="text-xs lg:text-sm text-muted-foreground whitespace-nowrap">Americans</span>
                </div>
                <p className="text-xs text-muted-foreground">Total with food allergies (~10%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children Affected */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-secondary/5 to-secondary/10 border-secondary/20">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline space-x-1 flex-wrap">
                  <span className="text-xl lg:text-2xl font-bold text-secondary font-poppins">
                    {childrenCount}M
                  </span>
                  <span className="text-xs lg:text-sm text-muted-foreground whitespace-nowrap">Children</span>
                </div>
                <p className="text-xs text-muted-foreground">1 in 13 kids affected</p>
              </div>
            </div>
            {/* Progress bar showing 1 in 13 */}
            <div className="w-full bg-secondary/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-secondary to-secondary/80 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(1/13) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Percentage of children with food allergies</p>
          </CardContent>
        </Card>

        {/* Hospital Visits */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-destructive" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline space-x-1 flex-wrap">
                  <span className="text-xl lg:text-2xl font-bold text-destructive font-poppins">
                    {hospitalCount}K
                  </span>
                  <span className="text-xs lg:text-sm text-muted-foreground whitespace-nowrap">ER Visits</span>
                </div>
                <p className="text-xs text-muted-foreground">Annual food allergy emergencies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Growth Trend Chart */}
      <div className="h-full flex">
        {/* Growth Trend - Full Height */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 flex-1">
          <CardContent className="p-3 lg:p-4 h-full flex flex-col">
            <div className="flex items-center space-x-2 mb-3 lg:mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="font-poppins font-semibold text-base lg:text-lg text-foreground">Growing Trend</h2>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              <div className="w-full h-40 lg:h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData} margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
                    <XAxis 
                      dataKey="year" 
                      className="text-xs"
                      tick={{ fontSize: 8 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[3, 8]} 
                      className="text-xs"
                      tick={{ fontSize: 8 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="prevalence" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                      className="animate-fade-in"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 lg:mt-3 gap-2">
              <p className="text-xs text-muted-foreground">Childhood food allergy prevalence</p>
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold text-primary font-poppins">+50%</p>
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