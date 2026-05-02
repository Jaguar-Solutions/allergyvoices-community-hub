/**
 * Decorative wave that softens the transition from page content into the
 * dark footer. The wave fills with the footer's foreground color.
 */
export function FooterWave() {
  return (
    <div className="relative -mb-px text-foreground" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="block w-full h-12 md:h-16"
      >
        <path
          d="M0,32 C240,72 480,8 720,32 C960,56 1200,16 1440,40 L1440,80 L0,80 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
