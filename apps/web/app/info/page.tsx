import { Architecture } from "~/components/info/architecture";
import { Comparison } from "~/components/info/comparison";
import { Cta } from "~/components/info/cta";
import { Faq } from "~/components/info/faq";
import { Features } from "~/components/info/features";
import { FourArtifacts } from "~/components/info/four-artifacts";
import { Hero } from "~/components/info/hero";
import { InfoNav } from "~/components/info/nav";
import { Pricing } from "~/components/info/pricing";
import { Quickstart } from "~/components/info/quickstart";
import { Workflow } from "~/components/info/workflow";

/**
 * Fully static by design — this page never calls the API, so it renders
 * identically whether or not `apps/api` is running.
 */
export default function InfoPage() {
  return (
    <>
      <InfoNav />
      <main>
        <Hero />
        <FourArtifacts />
        <Features />
        <Architecture />
        <Workflow />
        <Comparison />
        <Quickstart />
        <Pricing />
        <Faq />
        <Cta />
      </main>
    </>
  );
}
