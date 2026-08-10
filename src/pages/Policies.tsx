import { Link, useParams } from "react-router-dom";

import SEOHead from "@/components/SEOHead";
import { Container, PageHeader, PageLayout, Section } from "@/components/layout";
import { Disclaimer } from "@/components/layout";

/**
 * Privacy, Terms and Restaurant Participation, as one route with three
 * documents.
 *
 * DRAFTS FOR LEGAL REVIEW. Nobody with a licence has read these. They are
 * written to describe what the code actually does — which addresses, which
 * tables, which third parties — because a policy that describes an imagined
 * system is worse than none: it is a promise nobody is keeping.
 *
 * Anything genuinely unsettled is marked so a reviewer sees it rather than
 * having to notice its absence. Retention periods in particular are stated as
 * intentions, not as commitments, because no deletion job exists yet.
 */

const UPDATED = "August 9, 2026";

interface Doc {
  slug: string;
  title: string;
  intro: string;
  sections: { heading: string; body: string[]; anchor?: string }[];
}

const DOCS: Doc[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    intro:
      "What AllergyVoices collects, why, and what becomes public. Written to describe how the site actually works today.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "**Newsletter signups.** Your email address, and nothing else, when you join from the homepage or tick the box on a form.",
          "**Restaurant survey submissions.** Business details about a restaurant — name, address, phone, website, cuisine — together with its answers about allergy practices. Separately, a private contact name, position and email for the person who filled it in.",
          "**City and ambassador requests.** Your name, email, city and state, and anything you write in the message field.",
          "**Basic request data.** Our host records standard web server logs. We do not run advertising or cross-site tracking, and we do not sell or share personal information.",
        ],
      },
      {
        heading: "What becomes public, and what never does",
        body: [
          "Published restaurant listings show the restaurant's business information and its answers about allergy practices. That is the point of the directory, and no listing appears without the restaurant's permission.",
          "**The private contact name, position and email are never published.** They are stored in a separate table with no public read access of any kind, are used only to contact the restaurant about its own listing, and are excluded from the data the public site can read at all.",
          "Newsletter, city-request and ambassador details are never published.",
        ],
      },
      {
        heading: "Third parties we use",
        body: [
          "**Supabase** hosts our database and runs the functions that process form submissions.",
          "**Resend** delivers transactional email — survey confirmations, listing updates and improvement reports.",
          "**MailerLite** manages the newsletter list, where you have asked to join it.",
          "**Hostinger** serves the website.",
          "Each processes data on our behalf under their own terms. We do not pass your information to anyone else.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Restaurant submissions are kept as a version history so a listing can be corrected and audited. Newsletter addresses are kept until you unsubscribe. City and ambassador requests are kept while we are still working through expansion in that area.",
        ],
      },
      {
        heading: "Correcting or deleting your information",
        body: [
          "Email **info@allergyvoices.com** and we will correct or delete what we hold. A restaurant can update its own listing at any time using the link on its profile, or ask us to remove it entirely.",
          "We answer every message. If you have asked us to delete something and have not heard back, please email again — it means we missed it.",
        ],
      },
      {
        heading: "Children",
        body: [
          "AllergyVoices is written for parents, caregivers and adults managing food allergies. We do not knowingly collect information from children.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Use",
    intro: "The basis on which this site is offered.",
    sections: [
      {
        anchor: "medical-disclaimer",
        heading: "Medical disclaimer",
        body: [
          "Everything here is general educational information. It is not medical advice, and it is not a substitute for care from a qualified clinician who knows your situation. Decisions about your own allergy belong with your allergist.",
          "In an emergency, use your prescribed epinephrine and seek urgent medical care.",
        ],
      },
      {
        heading: "What the restaurant directory is",
        body: [
          "Listings contain standardized information provided by restaurants about their own practices, with the date each last confirmed it. AllergyVoices does not inspect, certify, approve, grade, endorse or verify any restaurant, and no listing is a guarantee that a meal can be prepared safely for any individual.",
          "Practices change, staff change, and suppliers change. Always discuss your specific needs with restaurant staff before ordering.",
        ],
      },
      {
        heading: "Accuracy",
        body: [
          "We summarize published research, regulatory decisions and official recall notices, and link to the original sources. We work carefully but cannot guarantee that every page is complete or current. Where an official source and this site disagree, the official source is correct.",
        ],
      },
      {
        heading: "Your use of the site",
        body: [
          "Please do not submit information about a restaurant you are not authorised to speak for, misrepresent a restaurant's practices, or attempt to disrupt the service. We may remove any submission or listing that appears inaccurate, misleading or unverifiable.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "AllergyVoices is provided as-is, without warranties. To the fullest extent permitted by law, we are not liable for decisions made on the basis of information published here.",
        ],
      },
    ],
  },
  {
    slug: "restaurant-participation",
    title: "Restaurant Participation Policy",
    intro:
      "How the directory works for restaurants, and what taking part does and does not mean.",
    sections: [
      {
        heading: "Restaurants describe themselves",
        body: [
          "Every listing is written by the restaurant. We ask a standard set of questions so that families can compare like with like, and we publish the answers given.",
          "Participation is free. It always will be. Nothing about a listing can be bought, and no paid service affects how or whether a restaurant appears.",
        ],
      },
      {
        heading: "What we do before publishing",
        body: [
          "We read each submission for clarity and completeness, and may come back with a question if an answer is ambiguous. We do not edit a restaurant's description of its own practices to make it sound better or worse.",
          "**We do not visit, inspect, test, score, certify or approve restaurants.** Reviewing a submission means checking it is clear — nothing more.",
        ],
      },
      {
        heading: "Permission to publish",
        body: [
          "Nothing appears publicly without permission. A restaurant may say yes, ask us to check back before publishing, or decline publication entirely and still keep its answers on file with us.",
          "The private contact details given in the survey are never published.",
        ],
      },
      {
        heading: "Updating or removing a listing",
        body: [
          "A restaurant can update its information at any time using the link on its own profile, and the confirmed-on date moves with it. A restaurant can ask us to remove its listing at any time, for any reason, and we will do so.",
        ],
      },
      {
        heading: "When we remove a listing ourselves",
        body: [
          "We may remove or hide a listing that appears outdated, misleading or unverifiable, or where a restaurant has closed or changed hands. We will try to reach the contact on file first.",
          "Listings show when the information was last confirmed precisely because practices change. An old date is information for a family, not a judgement about the restaurant.",
        ],
      },
      {
        heading: "What a listing is not",
        body: [
          "Taking part is not an endorsement by AllergyVoices, a certification, a rating, an inspection result, or a promise that any particular meal can be prepared safely. Guests must confirm their own needs with staff on every visit.",
        ],
      },
    ],
  },
];

const BY_SLUG = new Map(DOCS.map((d) => [d.slug, d]));

/** Bold spans written as **text** in the copy above. */
function renderBody(text: string, key: number) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*\[[^\]]+\]\*)/g);
  return (
    <p key={key} className="font-inter leading-relaxed text-muted-foreground">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("*[") && part.endsWith("]*")) {
          // Open questions for the reviewer, marked so they cannot be mistaken
          // for settled policy.
          return (
            <em key={i} className="text-foreground/70">
              {part.slice(1, -1)}
            </em>
          );
        }
        return part;
      })}
    </p>
  );
}

const Policies = () => {
  const { slug = "privacy" } = useParams();
  const doc = BY_SLUG.get(slug) ?? DOCS[0];

  return (
    <PageLayout>
      <SEOHead
        title={doc.title}
        description={doc.intro}
        canonical={`/policies/${doc.slug}`}
      />
      <PageHeader
        eyebrow="Policies"
        title={doc.title}
        intro={doc.intro}
        breadcrumbs={[{ label: "Policies" }, { label: doc.title }]}
      />

      <Section>
        <Container width="narrow">
          <p className="font-inter text-sm text-muted-foreground">
            Last updated {UPDATED}
          </p>

          {/* Open questions live in docs/legal-review-items.md, not in the
              public copy — a policy page reading like a work order undermines
              the thing it is trying to establish. */}
          <Disclaimer kind="info" title="Draft pending legal review" className="mt-4">
            This policy describes how AllergyVoices currently operates and will
            be updated following legal review.
          </Disclaimer>

          <div className="mt-10 space-y-10">
            {doc.sections.map((section) => (
              <section key={section.heading} id={section.anchor} className={section.anchor ? "scroll-mt-24" : undefined}>
                <h2 className="font-poppins text-xl font-bold text-foreground">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-4">
                  {section.body.map(renderBody)}
                </div>
              </section>
            ))}
          </div>

          <nav className="mt-14 border-t border-border pt-6" aria-label="Other policies">
            <h2 className="font-poppins font-semibold text-foreground">
              Other policies
            </h2>
            <ul className="mt-3 space-y-2">
              {DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
                <li key={d.slug}>
                  <Link
                    to={`/policies/${d.slug}`}
                    className="font-inter text-primary underline-offset-2 hover:underline"
                  >
                    {d.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/about#editorial"
                  className="font-inter text-primary underline-offset-2 hover:underline"
                >
                  Editorial Policy
                </Link>
              </li>
            </ul>
          </nav>
        </Container>
      </Section>
    </PageLayout>
  );
};

export default Policies;
