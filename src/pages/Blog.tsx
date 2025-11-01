import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

const blogPosts = [
  {
    slug: "fda-food-allergen-thresholds",
    title: "FDA Explores Food Allergen Thresholds: What Families Should Know",
    excerpt: "The U.S. Food & Drug Administration (FDA) has announced a virtual public meeting and listening session focusing on food allergen thresholds. Learn what this means for families managing food allergies.",
    date: "2025-01-15",
    author: "Allergy Voices Team",
    image: "/placeholder.svg"
  }
];

const Blog = () => {
  return (
    <>
      <SEOHead
        title="Blog | Allergy Voices"
        description="Stay informed with the latest insights, updates, and resources on food allergies, advocacy, and policy changes affecting families."
        keywords="food allergy blog, allergen policy updates, FDA food allergies, allergy advocacy news"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <Navigation />
        
        <main className="container mx-auto px-4 pt-24 pb-16">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="font-poppins text-4xl md:text-5xl font-bold text-foreground mb-6">
              Allergy Voices Blog
            </h1>
            <p className="font-inter text-lg text-muted-foreground">
              Stay informed with the latest insights, updates, and resources on food allergies, advocacy, and policy changes affecting families.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Card key={post.slug} className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.date}>
                        {new Date(post.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </time>
                    </div>
                    
                    <h2 className="font-poppins font-semibold text-xl text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="font-inter text-sm text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <Link to={`/blog/${post.slug}`}>
                      <Button variant="ghost" className="group/btn p-0 h-auto font-medium">
                        Read More 
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="font-inter text-sm text-muted-foreground">
              © 2025 Allergy Voices. Every ingredient matters. Every voice counts.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Blog;
