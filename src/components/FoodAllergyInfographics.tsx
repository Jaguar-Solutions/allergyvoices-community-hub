import React, { useState, useEffect } from 'react';
import { Users, Heart, TrendingUp, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Food allergy prevalence, as reported by the CDC.
 *
 * Every figure on this page comes from the National Health Interview Survey
 * and carries its own source link and data year. That constraint is the whole
 * design here, and it removed several numbers this component used to show:
 *
 *  - "32M Americans (~10%)" and "5.6M children (1 in 13)" came from Gupta et
 *    al. (2018/2019), a separate survey using a broader definition than NHIS.
 *    Showing those alongside CDC figures mixed two incompatible definitions.
 *  - "200K ER visits a year" could not be pinned to one source: published
 *    estimates range from ~30,000 to 3.4 million depending on what is
 *    counted. An unsourceable number is worse than no number.
 *  - The old "+50% since 1997" chart plotted 1997 → 2024, which is a ~124%
 *    change, not 50%. The 50% figure is CDC's 1997–1999 → 2009–2011
 *    childhood increase, and it is now plotted over exactly that window.
 *
 * Adults and children are both 2024 NHIS, so the two headline numbers are
 * directly comparable to each other.
 */

interface Stat {
  /** Numeric part, animated. */
  target: number;
  suffix: string;
  label: string;
  detail: string;
  /** Publication year and data year — they differ, and conflating them misleads. */
  year: string;
  source: string;
  sourceLabel: string;
  Icon: typeof Users;
  tint: string;
}

const STATS: Stat[] = [
  {
    target: 6.7,
    suffix: '%',
    label: 'of adults',
    detail: 'have a diagnosed food allergy',
    year: 'published 2026; 2024 data',
    source: 'https://www.cdc.gov/nchs/products/databriefs/db545.htm',
    sourceLabel: 'CDC NCHS Data Brief No. 545',
    Icon: Users,
    tint: 'text-primary',
  },
  {
    target: 5.3,
    suffix: '%',
    label: 'of children',
    detail: 'about 1 in 20, ages 0–17',
    year: 'published 2026; 2024 data',
    source: 'https://www.cdc.gov/nchs/products/databriefs/db546.htm',
    sourceLabel: 'CDC NCHS Data Brief No. 546',
    Icon: Heart,
    tint: 'text-secondary-strong',
  },
];

/**
 * The childhood trend, plotted over the window the +50% figure actually
 * describes. Only the two endpoints CDC published are shown — inventing
 * intermediate points to make a smoother line would be making up data.
 */
const TREND = {
  from: { period: '1997–1999', value: 3.4 },
  to: { period: '2009–2011', value: 5.1 },
  change: '+50%',
  source: 'https://www.cdc.gov/nchs/products/databriefs/db121.htm',
  sourceLabel: 'CDC NCHS Data Brief No. 121',
  sourceYear: 'published 2013; 1997-2011 data',
};

function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const DURATION = 900;
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION);
      // Round to one decimal so a 6.7 never renders as 6.699999.
      setValue(Math.round(target * progress * 10) / 10);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

function StatValue({ target, suffix }: { target: number; suffix: string }) {
  const value = useCountUp(target);
  return (
    <>
      {value.toFixed(1)}
      {suffix}
    </>
  );
}

function SourceLink({ href, label, year }: { href: string; label: string; year: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-sm font-inter text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label} ({year})
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </a>
  );
}

const FoodAllergyInfographics = () => {
  return (
    <>
      {/* Phones get the numbers without the full card stack. The desktop
          treatment is tall enough to push everything below it more than a
          full scroll away. */}
      <ul className="grid grid-cols-2 gap-2 lg:hidden" aria-label="Food allergy prevalence">
        {STATS.map(({ target, suffix, label, Icon, tint }) => (
          <li
            key={label}
            className="rounded-xl border border-border bg-background/70 p-3 text-center backdrop-blur-sm"
          >
            <Icon className={`mx-auto h-4 w-4 ${tint}`} aria-hidden="true" />
            <span className="mt-1 block font-poppins text-xl font-bold text-foreground">
              <StatValue target={target} suffix={suffix} />
            </span>
            <span className="block font-inter text-xs leading-tight text-muted-foreground">
              {label}
            </span>
          </li>
        ))}
        <li className="col-span-2 text-center">
          <span className="font-inter text-[11px] text-muted-foreground">
            CDC National Health Interview Survey, 2024 data
          </span>
        </li>
      </ul>

      <div className="mx-auto hidden max-w-5xl gap-4 lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="space-y-3 lg:space-y-4">
          {STATS.map(({ target, suffix, label, detail, year, source, sourceLabel, Icon, tint }) => (
            <Card
              key={label}
              className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
            >
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 lg:h-12 lg:w-12">
                    <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${tint}`} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className={`font-poppins text-xl font-bold lg:text-2xl ${tint}`}>
                        <StatValue target={target} suffix={suffix} />
                      </span>
                      <span className="font-inter text-xs text-muted-foreground lg:text-sm">
                        {label}
                      </span>
                    </div>
                    <p className="font-inter text-xs text-muted-foreground">{detail}</p>
                    <p className="mt-1">
                      <SourceLink href={source} label={sourceLabel} year={year} />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Childhood trend */}
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardContent className="flex h-full flex-col p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" />
              <h3 className="font-poppins text-sm font-semibold text-foreground">
                Childhood food allergy rose over this period
              </h3>
            </div>

            <div className="mt-4 flex flex-1 items-end gap-4">
              {[TREND.from, TREND.to].map((point, index) => (
                <div key={point.period} className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-poppins text-lg font-bold text-foreground">
                    {point.value}%
                  </span>
                  {/* Bar heights are proportional to the values and the axis
                      starts at zero, so the visual ratio matches the numbers. */}
                  <div
                    className={`w-full rounded-t-md ${
                      index === 0 ? 'bg-primary/30' : 'bg-primary'
                    }`}
                    style={{ height: `${(point.value / 6) * 120}px` }}
                    aria-hidden="true"
                  />
                  <span className="font-inter text-xs text-muted-foreground">
                    {point.period}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <p className="font-inter text-sm">
                <span className="font-poppins font-bold text-primary">{TREND.change}</span>{' '}
                <span className="text-muted-foreground">
                  among children, {TREND.from.period} to {TREND.to.period}
                </span>
              </p>
              <p className="mt-1">
                <SourceLink href={TREND.source} label={TREND.sourceLabel} year={TREND.sourceYear} />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FoodAllergyInfographics;
