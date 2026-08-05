# Editorial workflow

> **Note:** the restaurant transparency program *does* have an admin dashboard
> at `/admin`, because restaurant submissions are third-party operational data,
> not editorial content. See
> [`docs/RESTAURANT_PROGRAM.md`](./docs/RESTAURANT_PROGRAM.md). Everything
> below still applies to articles, recalls, allergen hubs, and resources.

Editorial content has no admin panel. It happens in **GitHub pull requests**.

- Add or edit a markdown file in [`/content/`](./content/).
- Open a pull request.
- The PR is your review queue (drafts, comments, approvals, merge = publish).
- CI runs `npm run content:check` and `npm run build` on every PR &mdash;
  invalid frontmatter or broken builds fail the check before merging.

See [`/content/README.md`](./content/README.md) for:

- Where each content type lives (`articles/`, `recalls/`, `allergens/`, etc.)
- The full frontmatter schema for each
- Editorial standards (plain language, sources required, no AI auto-publish)

That's it. No accounts, no role tables, no logging in to anything.
