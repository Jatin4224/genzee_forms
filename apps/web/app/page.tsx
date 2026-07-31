import { BentoFeatures } from "~/components/landing/bento-features";
import { Comparison } from "~/components/landing/comparison";
import { HowItWorks } from "~/components/landing/how-it-works";
import { LandingCtaBand } from "~/components/landing/landing-cta-band";
import { LandingFaq } from "~/components/landing/landing-faq";
import { LandingFooter } from "~/components/landing/landing-footer";
import { LandingHeader } from "~/components/landing/landing-header";
import { LandingHero } from "~/components/landing/landing-hero";
import { StatsBand } from "~/components/landing/stats-band";

export default function Home() {
  return (
    <div className="min-h-svh bg-background">
      <LandingHeader />
      <main>
        <LandingHero />
        <StatsBand />
        <HowItWorks />
        {/* alternating tinted bands give the page a clear vertical rhythm */}
        <div className="bg-secondary/30">
          <BentoFeatures />
        </div>
        <Comparison />
        <div className="bg-secondary/30">
          <LandingFaq />
        </div>
        <LandingCtaBand />
      </main>
      <LandingFooter />
    </div>
  );
}
