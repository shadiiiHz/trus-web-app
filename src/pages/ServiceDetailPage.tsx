import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { ServiceDetailHero } from "@/components/service-detail/ServiceDetailHero";
import { ServiceDetailCreator } from "@/components/service-detail/ServiceDetailCreator";
import { ServiceDetailFocus } from "@/components/service-detail/ServiceDetailFocus";
import { ServiceDetailPublisher } from "@/components/service-detail/ServiceDetailPublisher";
import { ServiceDetailMultilingual } from "@/components/service-detail/ServiceDetailMultilingual";
import { ServiceDetailLocalization } from "@/components/service-detail/ServiceDetailLocalization";
import { ServiceDetailMarketInsights } from "@/components/service-detail/ServiceDetailMarketInsights";
import { ServiceDetailFocusedGrowth } from "@/components/service-detail/ServiceDetailFocusedGrowth";
import { ServiceDetailAbout } from "@/components/service-detail/ServiceDetailAbout";
import { ServiceDetailPublishing } from "@/components/service-detail/ServiceDetailPublishing";
import { ServiceDetailTiming } from "@/components/service-detail/ServiceDetailTiming";
import { ServiceDetailWorkflow } from "@/components/service-detail/ServiceDetailWorkflow";
import { ServiceDetailProcess } from "@/components/service-detail/ServiceDetailProcess";
import { ServiceDetailStrategy } from "@/components/service-detail/ServiceDetailStrategy";
import { ServiceDetailIntelligence } from "@/components/service-detail/ServiceDetailIntelligence";
import { ServiceDetailStack } from "@/components/service-detail/ServiceDetailStack";
import { ServiceDetailFlexible } from "@/components/service-detail/ServiceDetailFlexible";
import { ServiceDetailGrowth } from "@/components/service-detail/ServiceDetailGrowth";
import { ServiceDetailContact } from "@/components/service-detail/ServiceDetailContact";
import {
  getServiceContent,
  getServiceDetail,
  getServiceName,
  serviceDetailPath,
} from "@/config/serviceDetails.config";
import { usePageMeta } from "@/hooks/usePageMeta";
import NotFoundPage from "@/pages/NotFoundPage";

/** `/services/:slug` — one page per service, driven by `serviceDetails.config`. */
export default function ServiceDetailPage() {
  const { slug } = useParams();
  const service = getServiceDetail(slug);
  const content = service ? getServiceContent(service) : undefined;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  usePageMeta({
    title: content?.metaTitle ?? "TruS",
    description: content?.metaDescription ?? "",
    path: service ? serviceDetailPath(service.slug) : "/services",
  });

  if (!service || !content) return <NotFoundPage />;

  return (
    <div className="bg-brand-white min-h-screen font-body antialiased">
      <Navbar />

      {/* Clears the fixed Navbar (h-21 mobile / h-18 desktop). */}
      <div className="pt-21 lg:pt-18">
        <ServiceDetailHero
          name={content.name}
          tagline={content.tagline}
          image={service.heroImage}
          textY={service.heroTextY}
          desktopFade={service.heroDesktopFade}
          wideTitle={service.heroWideTitle}
          taglineMobile={content.taglineMobile}
          mobileAlign={service.heroMobile?.align}
          mobileImageX={service.heroMobile?.imageX}
          mobileTitleWidth={service.heroMobile?.titleWidth}
        />
      </div>

      {content.creator && service.creatorImages && (
        <ServiceDetailCreator creator={content.creator} images={service.creatorImages} />
      )}

      {content.focus && service.focusImage && <ServiceDetailFocus focus={content.focus} image={service.focusImage} />}

      {content.publisher && service.publisherImage && (
        <ServiceDetailPublisher publisher={content.publisher} image={service.publisherImage} />
      )}

      {content.multilingual && <ServiceDetailMultilingual multilingual={content.multilingual} />}

      {content.localization && service.localizationImage && (
        <ServiceDetailLocalization localization={content.localization} image={service.localizationImage} />
      )}

      {content.marketInsights && service.marketInsightsImage && (
        <ServiceDetailMarketInsights insights={content.marketInsights} image={service.marketInsightsImage} />
      )}

      {content.focusedGrowth && service.focusedGrowthImages && (
        <ServiceDetailFocusedGrowth growth={content.focusedGrowth} images={service.focusedGrowthImages} />
      )}

      {content.about && content.gain && (
        <ServiceDetailAbout
          about={content.about}
          gain={content.gain}
          highlights={content.highlights}
          glow={service.aboutGlow}
          tight={service.aboutTight}
          textLeading={service.aboutTextLeading}
          aboutImageSize={service.aboutImageSize}
          highlightsImageSize={service.highlightsImageSize}
        />
      )}

      {content.process && <ServiceDetailProcess process={content.process} accordion={service.processAccordion} />}

      {content.publishing && service.publishingImage && (
        <ServiceDetailPublishing
          publishing={content.publishing}
          image={service.publishingImage}
          icons={service.publishingIcons}
        />
      )}

      {content.timing && <ServiceDetailTiming timing={content.timing} />}

      {content.workflow && service.workflowImages && (
        <ServiceDetailWorkflow
          workflow={content.workflow}
          growthImage={service.workflowImages.growth}
          workflowImage={service.workflowImages.workflow}
        />
      )}

      {content.strategy && service.strategyImage && (
        <ServiceDetailStrategy strategy={content.strategy} image={service.strategyImage} />
      )}

      {content.intelligence && service.intelligenceImage && (
        <ServiceDetailIntelligence intelligence={content.intelligence} image={service.intelligenceImage} />
      )}

      {content.automation && service.stackImage && (
        <ServiceDetailStack automation={content.automation} image={service.stackImage} icons={service.stackIcons} />
      )}

      {content.flexible && <ServiceDetailFlexible flexible={content.flexible} />}

      {content.growth && service.growthImage && <ServiceDetailGrowth growth={content.growth} image={service.growthImage} />}

      {content.contact && (
        <ServiceDetailContact
          subject={getServiceName(service)}
          heading={content.contact.heading}
          description={content.contact.description}
          descriptionDesktop={content.contact.descriptionDesktop}
          wide={content.contact.wide}
        />
      )}

      <FooterSection />
    </div>
  );
}
