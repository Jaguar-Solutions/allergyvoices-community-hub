import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, AlertCircle } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  isPinned?: boolean;
}

const NewsFeed = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // RSS feed sources
  const rssSources = [
    { name: 'FARE', url: 'https://www.foodallergy.org/media-room/news-releases' },
    { name: 'Kids With Food Allergies', url: 'https://kidswithfoodallergies.org/news-research/' },
    { name: 'Allergic Living', url: 'https://www.allergicliving.com/news/' },
    { name: 'SnackSafely', url: 'https://snacksafely.com/' }
  ];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      // Mock data for demo - in production, this would fetch from RSS feeds
      // You can integrate with services like rss2json.com or create a backend endpoint
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'FDA Approves New Xolair Treatment for Food Allergies',
          summary: 'The FDA has approved Xolair (omalizumab) as the first medication to treat multiple food allergies, marking a significant breakthrough.',
          date: '2024-02-20',
          source: 'FARE',
          url: 'https://www.fda.gov/news-events/press-announcements/fda-approves-first-medication-treat-multiple-food-allergies',
          isPinned: true
        },
        {
          id: '2',
          title: 'New Study Shows Promise for Peanut Allergy Patch',
          summary: 'Phase 3 trials demonstrate encouraging results for epicutaneous immunotherapy patch treatment in children with peanut allergies.',
          date: '2024-02-15',
          source: 'Allergic Living',
          url: 'https://www.allergicliving.com/news/',
        },
        {
          id: '3',
          title: 'School Allergy Management Guidelines Updated',
          summary: 'New recommendations for managing food allergies in educational settings include updated protocols for emergency response.',
          date: '2024-02-10',
          source: 'Kids With Food Allergies',
          url: 'https://kidswithfoodallergies.org/news-research/',
        },
        {
          id: '4',
          title: 'Restaurant Chain Announces Allergen-Free Menu',
          summary: 'Major food chain introduces comprehensive allergy-friendly options with dedicated preparation areas and staff training.',
          date: '2024-02-05',
          source: 'SnackSafely',
          url: 'https://snacksafely.com/',
        }
      ];

      // Filter items from past 60 days
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const recentNews = mockNews.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= sixtyDaysAgo;
      });

      setNewsItems(recentNews);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'FARE': return 'bg-primary/10 text-primary';
      case 'Kids With Food Allergies': return 'bg-secondary/10 text-secondary';
      case 'Allergic Living': return 'bg-accent/10 text-accent';
      case 'SnackSafely': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-2xl">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {newsItems.map((item) => (
          <Card 
            key={item.id} 
            className={`rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative ${
              item.isPinned ? 'ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-primary/10' : ''
            }`}
          >
            <CardContent className="p-6 space-y-4">
              {item.isPinned && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Badge className={`text-xs font-medium ${getSourceColor(item.source)}`}>
                  {item.source}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(item.date)}
                </div>
              </div>
              
              <h3 className="font-poppins font-semibold text-lg text-foreground leading-tight">
                {item.title}
              </h3>
              
              <p className="font-inter text-sm text-muted-foreground line-clamp-3">
                {item.summary}
              </p>
              
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Read more
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <p className="font-inter text-sm text-muted-foreground">
          News updates from trusted food allergy organizations and resources
        </p>
      </div>
    </div>
  );
};

export default NewsFeed;