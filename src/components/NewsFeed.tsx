import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, AlertTriangle } from "lucide-react";

interface NewsItem {
  title: string;
  description: string;
  pubDate: string;
  link: string;
  guid: string;
}

interface RSSResponse {
  status: string;
  feed: {
    title: string;
    description: string;
  };
  items: NewsItem[];
}

const NewsFeed = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        'https://api.rss2json.com/v1/api.json?rss_url=https://www.allergicliving.com/feed/'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data: RSSResponse = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error('RSS feed error');
      }
      
      // Get the 4 most recent articles
      const recentItems = data.items.slice(0, 4);
      setNewsItems(recentItems);
      
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('No recent allergy news available. Please check back soon.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    // Remove HTML tags and get plain text
    const plainText = text.replace(/<[^>]*>/g, '').trim();
    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength).trim() + '...'
      : plainText;
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
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

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="font-inter text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {newsItems.map((item) => (
          <Card 
            key={item.guid} 
            className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge className="text-xs font-medium bg-accent/10 text-accent-strong">
                  Allergic Living
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(item.pubDate)}
                </div>
              </div>
              
              <h3 className="font-poppins font-semibold text-lg text-foreground leading-tight">
                {item.title}
              </h3>
              
              <p className="font-inter text-sm text-muted-foreground">
                {truncateText(item.description)}
              </p>
              
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              >
                Read more
                <span className="sr-only"> about {item.title}</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <p className="font-inter text-sm text-muted-foreground">
          Latest news from Allergic Living
        </p>
      </div>
    </div>
  );
};

export default NewsFeed;