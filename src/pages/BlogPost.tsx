import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { SubscriptionForm } from "@/components/SubscriptionForm";
import fdaThresholdsHero from "@/assets/fda-thresholds-hero.png";

const blogContent: Record<string, any> = {
  "fda-food-allergen-thresholds": {
    title: "FDA Explores Food Allergen Thresholds: What Families Should Know",
    date: "2025-11-02",
    author: "Allergy Voices Team",
    metaDescription: "Learn what food allergen thresholds are, what the FDA is considering, what other countries are doing, and what that means for families managing food allergies.",
    content: (
      <>
        <section className="mb-12">
          <p className="font-inter text-lg text-muted-foreground leading-relaxed">
            The U.S. Food & Drug Administration (FDA) has announced a virtual public meeting and listening session 
            focusing on food allergen thresholds — the amounts of allergenic protein in food that might trigger 
            reactions in allergic individuals. This post explains what that means for families managing food allergies, 
            how other countries are already working on thresholds, and how you can stay informed.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-poppins text-2xl md:text-3xl font-bold text-foreground mb-6">
            What Are Food Allergen Thresholds?
          </h2>
          <div className="space-y-4 font-inter text-muted-foreground leading-relaxed">
            <p>
              Food allergen thresholds refer to the amounts of allergen protein in food below which the vast majority 
              of allergic individuals would not experience a reaction. These thresholds are scientifically determined 
              levels that help inform food safety regulations and labeling practices.
            </p>
            <p>
              It's important to distinguish thresholds from individual diagnosis or IgE levels. While your doctor 
              measures your specific sensitivity through blood tests or skin pricks, thresholds are population-based 
              reference points. Terms like ED01 (eliciting dose affecting 1% of allergic individuals) and ED05 
              (affecting 5%) are used in research to establish these benchmarks.
            </p>
            <p>
              Thresholds are not about determining if someone has an allergy—they're about understanding at what 
              levels allergens in food become a concern for most people with that specific allergy.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-poppins text-2xl md:text-3xl font-bold text-foreground mb-6">
            Why It Matters to Families
          </h2>
          <div className="space-y-4 font-inter text-muted-foreground leading-relaxed">
            <p>
              Understanding allergen thresholds has real everyday consequences for families managing food allergies:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Labeling clarity:</strong> Thresholds could lead to more accurate "may contain" statements, 
                helping families make better-informed choices instead of avoiding entire categories of food unnecessarily.
              </li>
              <li>
                <strong>Restaurant safety:</strong> Clear threshold guidelines can help restaurants better understand 
                cross-contact risks and implement more effective allergen management protocols.
              </li>
              <li>
                <strong>Hidden allergens:</strong> Establishing thresholds helps identify when trace amounts of 
                allergens require disclosure, reducing surprises and improving transparency.
              </li>
            </ul>
            <p>
              The outcome of threshold implementation promises improved safety and clearer information. However, there 
              are also potential risks if thresholds are misunderstood or misapplied. Families need to understand that 
              thresholds represent population averages—individual sensitivity can vary, and the most sensitive individuals 
              must always remain the priority in safety decisions.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-poppins text-2xl md:text-3xl font-bold text-foreground mb-6">
            What the FDA Is Doing
          </h2>
          <div className="space-y-4 font-inter text-muted-foreground leading-relaxed">
            <p>
              The FDA has organized a virtual public meeting and listening session to gather stakeholder input on how 
              allergen thresholds might be applied in the United States. The purpose is to explore how thresholds could 
              be used for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Food labeling requirements and advisory statements</li>
              <li>Manufacturing practices and cross-contact prevention</li>
              <li>Risk assessment frameworks for food safety</li>
            </ul>
            <p>
              While the meeting schedule has experienced postponements, the FDA's commitment to this initiative signals 
              an important shift toward science-based allergen management. What's at stake is the potential for a more 
              standardized, predictable food system that better serves allergic consumers while reducing unnecessary 
              restrictions on safe foods.
            </p>
            <p>
              The FDA is seeking input from medical professionals, food manufacturers, advocacy groups, and families to 
              ensure any threshold implementation balances safety with practical considerations.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-poppins text-2xl md:text-3xl font-bold text-foreground mb-6">
            What Other Countries Are Doing
          </h2>
          <div className="space-y-6 font-inter text-muted-foreground leading-relaxed">
            <div>
              <h3 className="font-poppins text-xl font-semibold text-foreground mb-3">
                European Union (EU)
              </h3>
              <p>
                Regulatory bodies in the EU, particularly the European Food Safety Authority (EFSA), have been working 
                on reference doses for certain allergens. EFSA has established Eliciting Dose (ED) values for several 
                priority allergens and is applying preventive, risk-based approaches to allergen control. The EU has 
                also developed the VITAL (Voluntary Incidental Trace Allergen Labeling) system, which many manufacturers 
                use for precautionary allergen labeling.
              </p>
            </div>
            
            <div>
              <h3 className="font-poppins text-xl font-semibold text-foreground mb-3">
                Australia & New Zealand
              </h3>
              <p>
                Food Standards Australia New Zealand (FSANZ) has been at the forefront of threshold discussions and 
                developed the VITAL program, which provides a standardized approach to assessing and managing allergen 
                cross-contact risks. FSANZ has also worked on refining advisory statements for allergens to make them 
                more meaningful and consistent across products.
              </p>
            </div>
            
            <div>
              <h3 className="font-poppins text-xl font-semibold text-foreground mb-3">
                Canada
              </h3>
              <p>
                Health Canada has engaged in consultation processes regarding food allergen thresholds and precautionary 
                labeling. While Canada hasn't formally adopted specific threshold values, Health Canada continues to 
                review international research and best practices to inform their regulatory approach to allergen 
                management and labeling.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-poppins text-2xl md:text-3xl font-bold text-foreground mb-6">
            How Allergy Voices Supports You
          </h2>
          <div className="space-y-4 font-inter text-muted-foreground leading-relaxed">
            <p>
              At Allergy Voices, we're committed to tracking developments from the FDA and around the globe. As 
              threshold proposals evolve, we'll help interpret what they mean for families navigating daily life 
              with food allergies and for restaurants working to serve allergic customers safely.
            </p>
            <p>
              We believe in amplifying the voices of those most affected by these policies—families, individuals with 
              allergies, and healthcare providers who understand the real-world implications of regulatory decisions.
            </p>
            <p>
              <strong>How you can get involved:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sign up for our updates to stay informed about FDA meetings and threshold developments</li>
              <li>Share your experiences and concerns—your voice matters in shaping policy</li>
              <li>Join our advocacy efforts to ensure threshold implementation prioritizes safety</li>
              <li>Connect with other families in our community to share information and support</li>
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
            <h2 className="font-poppins text-2xl md:text-3xl font-bold text-foreground mb-6">
              Stay Informed
            </h2>
            <p className="font-inter text-muted-foreground mb-6 leading-relaxed">
              While food allergen thresholds offer promise for safer, more transparent food systems, they must always 
              prioritize the most sensitive individuals. The science is evolving, and so are the policies that will 
              shape how families manage food allergies in the years to come.
            </p>
            <p className="font-inter text-muted-foreground mb-6 leading-relaxed">
              Your story, your concerns, and your advocacy can make a real difference. Subscribe to our updates, 
              share this post with others who care about food allergy safety, and stay alert for upcoming FDA 
              announcements and opportunities to participate in the conversation.
            </p>
            <p className="font-inter font-semibold text-foreground text-lg">
              Together, we can ensure every voice counts in making food safer for everyone.
            </p>
          </div>
        </section>
      </>
    )
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogContent[slug] : null;

  if (!post) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-poppins text-4xl font-bold mb-4">Post Not Found</h1>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`${post.title} | Allergy Voices`}
        description={post.metaDescription}
        keywords="FDA food allergen thresholds, food allergy policy, allergen labeling, EFSA allergen reference doses, FSANZ VITAL program"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        <Navigation />
        
        <main className="container mx-auto px-4 pt-24 pb-16">
          {/* Back Button */}
          <div className="max-w-4xl mx-auto mb-8">
            <Link to="/blog">
              <Button variant="ghost" className="group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Blog
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <article className="max-w-4xl mx-auto">
            <header className="mb-12">
              {/* Hero Image */}
              <div className="aspect-[21/9] rounded-3xl mb-8 overflow-hidden">
                <img 
                  src={fdaThresholdsHero} 
                  alt="Food allergen threshold concept illustration showing a family dining and a clipboard with threshold chart" 
                  className="w-full h-full object-cover"
                />
              </div>

              <h1 className="font-poppins text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
              </div>
            </header>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {post.content}
            </div>

            {/* CTA Section */}
            <div className="mt-16 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-8 md:p-12 border border-primary/20">
              <div className="max-w-2xl mx-auto text-center">
                <h3 className="font-poppins text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Join the Voices
                </h3>
                <p className="font-inter text-muted-foreground mb-8">
                  Subscribe to stay updated on FDA developments, policy changes, and advocacy opportunities 
                  that affect families managing food allergies.
                </p>
                <SubscriptionForm />
              </div>
            </div>
          </article>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm py-8 mt-16">
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

export default BlogPost;
