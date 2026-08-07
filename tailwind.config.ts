import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          subtle: "hsl(var(--background-subtle))",
        },
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Darker blue for small text sitting on a tinted (non-white)
          // surface, where the default primary lands just under 4.5:1.
          strong: "hsl(var(--primary-strong))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          // Green dark enough to read as small text on a green tint, where
          // the default secondary lands at 4.37:1 — just under AA.
          strong: "hsl(var(--secondary-strong))",
          hover: "hsl(var(--secondary-hover))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          // Coral dark enough to be readable as text on light backgrounds.
          // Use `text-accent-strong`, never `text-accent`, for small text.
          strong: "hsl(var(--accent-strong))",
          hover: "hsl(var(--accent-hover))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          // Fourth member of the same family as primary/secondary/accent
          // -strong: a semantic colour used as small text on its own tint
          // never clears 4.5:1 at its default lightness.
          strong: "hsl(var(--destructive-strong))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        brand: {
          cyan: "hsl(var(--brand-cyan))",
          coral: "hsl(var(--brand-coral))",
          sun: "hsl(var(--brand-sun))",
          spring: "hsl(var(--brand-spring))",
          berry: "hsl(var(--brand-berry))",
        },
        allergen: {
          peanut: "hsl(var(--allergen-peanut))",
          "tree-nuts": "hsl(var(--allergen-tree-nuts))",
          milk: "hsl(var(--allergen-milk))",
          egg: "hsl(var(--allergen-egg))",
          sesame: "hsl(var(--allergen-sesame))",
          wheat: "hsl(var(--allergen-wheat))",
          soy: "hsl(var(--allergen-soy))",
          fish: "hsl(var(--allergen-fish))",
          shellfish: "hsl(var(--allergen-shellfish))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
