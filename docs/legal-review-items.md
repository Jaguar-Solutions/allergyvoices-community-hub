# Legal review items

Open questions in the public policy pages at `/policies/*`. These were written
into the drafts as bracketed notes; they are collected here so the public
pages read as policy rather than as a work order.

Nothing here has been reviewed by a lawyer.

## Data retention

The Privacy Policy says restaurant submissions are kept as a version history,
newsletter addresses until unsubscribe, and city requests while expansion in
that area is active.

**No automatic deletion job exists.** Those are intentions, not commitments.
Either add a scheduled task that enforces them, or reword the policy to
describe what actually happens.

## Governing law and limitation of liability

Terms of Use carries a plain-language as-is disclaimer. A lawyer should set:

- Governing law and venue, matching the entity's state
- Limitation-of-liability language appropriate to the entity type
- Whether an arbitration or class-action waiver clause is wanted

## Entity name and legal status

The site says "family-led food-allergy initiative" and deliberately claims no
nonprofit, medical, certifying or governmental status. If an LLC or nonprofit
exists or is formed, the policies should name it, and the About page should
say what it is.

## State privacy law

The launch region is North Carolina, but the directory is nationwide and the
newsletter has no geographic limit. Worth confirming whether obligations under
CCPA/CPRA (California) and similar state laws are triggered by volume, and
whether a "Do Not Sell or Share" link is required. We do not sell data, which
likely simplifies this.

## Email marketing consent

Newsletter signups come from the homepage form and an unticked checkbox on the
city-request form. Confirm CAN-SPAM compliance for the transactional and
marketing paths, that unsubscribe is present in every marketing email, and how
MailerLite's own consent records interact with ours.

## Processor agreements

Supabase, Resend, MailerLite and Hostinger process data on our behalf. Confirm
whether Data Processing Agreements are needed and are in place.

## Restaurant contact data

Private restaurant contact details are stored with no public read policy and
are never published. Confirm whether a business contact given for the purpose
of a listing needs anything further — retention, or a stated basis for use.
