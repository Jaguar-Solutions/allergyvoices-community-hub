<!--
Thanks for contributing to AllergyVoices.

If this PR adds or edits CONTENT (articles, recalls, allergen hubs, resources,
stories), use the editorial section. If it changes CODE, use the code section.
You can keep both.
-->

## Summary

<!-- One or two sentences describing the change. -->

## What changed

<!-- For content edits: what's new or different? Why? -->
<!-- For code: what user-visible behavior changes? -->

---

### Editorial checklist (content PRs only)

- [ ] Frontmatter `status` is set correctly: `draft` while in progress, `needs-review` when ready for another set of eyes, `published` only when approved
- [ ] `last_reviewed` updated to today's date
- [ ] `reviewed_by` set to the human reviewer (not "AI" or "ChatGPT")
- [ ] All factual claims have a source link in the `sources` list (for articles) or `source_url` (for recalls)
- [ ] Plain language, no medical promises, no fear-based framing
- [ ] If AI-drafted: started as `needs-review`, **never** committed as `published` without a human review
- [ ] `npm run content:check` passes locally

### Code checklist (code PRs only)

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Manually clicked through any pages I touched in `npm run dev`
- [ ] No new accessibility regressions (focus states, heading order, alt text)
- [ ] No new dependencies without a brief reason

### Reviewer notes

<!-- Anything you want a reviewer to look at specifically. -->
