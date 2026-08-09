# Fonts embedded in generated PDFs

`Poppins-Bold` and `Poppins-SemiBold` are the Allergy Voices heading face,
matching `--font-poppins` on the site. Both are SIL Open Font License 1.1,
which permits embedding.

Source: https://github.com/google/fonts/tree/main/ofl/poppins

Body text uses Helvetica, one of the PDF base-14 fonts. It is not embedded at
all, so it costs nothing in file size and cannot fail to resolve on a reader.
The site's body face is Inter, whose only static-TTF distribution is an 876 KB
variable font that fontkit subsets unreliably; Helvetica and Inter are both
neo-grotesques, so the substitution is close in feel and far more robust.

Both Poppins faces are embedded with `subset: true`, so a generated report
carries only the glyphs it actually uses.
