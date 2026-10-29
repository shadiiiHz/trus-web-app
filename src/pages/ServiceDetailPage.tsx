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
import { ServiceDetailAboutService } from "@/components/service-detail/ServiceDetailAboutService";
import { ServiceDetailCreatorOverview } from "@/components/service-detail/ServiceDetailCreatorOverview";
import { ServiceDetailMarketAccounts } from "@/components/service-detail/ServiceDetailMarketAccounts";
import { ServiceDetailTimingPerformance } from "@/components/service-detail/ServiceDetailTimingPerformance";
import { ServiceDetailCreatorGuide } from "@/components/service-detail/ServiceDetailCreatorGuide";
import { ServiceDetailChannelCreator } from "@/components/service-detail/ServiceDetailChannelCreator";
import { ServiceDetailChannelStrategy } from "@/components/service-detail/ServiceDetailChannelStrategy";
import { ServiceDetailChannelLocal } from "@/components/service-detail/ServiceDetailChannelLocal";
import { ServiceDetailChannelMarket } from "@/components/service-detail/ServiceDetailChannelMarket";
import { ServiceDetailChannelGrowth } from "@/components/service-detail/ServiceDetailChannelGrowth";
import { ServiceDetailChannelWorkflow } from "@/components/service-detail/ServiceDetailChannelWorkflow";
import { ServiceDetailMission } from "@/components/service-detail/ServiceDetailMission";
import { ServiceDetailEcosystem } from "@/components/service-detail/ServiceDetailEcosystem";
import { ServiceDetailIntro } from "@/components/service-detail/ServiceDetailIntro";
import { ServiceDetailOverview } from "@/components/service-detail/ServiceDetailOverview";
import { ServiceDetailContentCreator } from "@/components/service-detail/ServiceDetailContentCreator";
import { ServiceDetailPublisherLight } from "@/components/service-detail/ServiceDetailPublisherLight";
import { ServiceDetailMarketStrategy } from "@/components/service-detail/ServiceDetailMarketStrategy";
import { ServiceDetailAudience } from "@/components/service-detail/ServiceDetailAudience";
import { ServiceDetailResponses } from "@/components/service-detail/ServiceDetailResponses";
import { ServiceDetailJourney } from "@/components/service-detail/ServiceDetailJourney";
import { ServiceDetailBenefits } from "@/components/service-detail/ServiceDetailBenefits";
import { ServiceDetailMatters } from "@/components/service-detail/ServiceDetailMatters";
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
          figma={service.heroFigma}
          taglineMobile={content.taglineMobile}
          mobileAlign={service.heroMobile?.align}
          mobileImageX={service.heroMobile?.imageX}
          mobileTitleWidth={service.heroMobile?.titleWidth}
        />
      </div>

      {content.mission && service.missionImage && (
        <ServiceDetailMission content={content.mission} image={service.missionImage} />
      )}

      {content.aboutService && service.aboutServiceImage && (
        <ServiceDetailAboutService content={content.aboutService} image={service.aboutServiceImage} />
      )}

      {content.creatorOverview && service.creatorOverviewImage && (
        <ServiceDetailCreatorOverview content={content.creatorOverview} image={service.creatorOverviewImage} />
      )}

      {content.intro && service.introImage && <ServiceDetailIntro intro={content.intro} image={service.introImage} figma={service.introFigma} />}

      {content.creatorGuide && service.creatorGuideImages && (
        <ServiceDetailCreatorGuide content={content.creatorGuide} images={service.creatorGuideImages} />
      )}

      {content.channelCreator && service.channelCreatorImages && (
        <ServiceDetailChannelCreator content={content.channelCreator} images={service.channelCreatorImages} />
      )}

      {content.overview && service.overviewImage && (
        <ServiceDetailOverview overview={content.overview} image={service.overviewImage} />
      )}

      {content.contentCreator && service.contentCreatorImage && (
        <ServiceDetailContentCreator
          content={content.contentCreator}
          image={service.contentCreatorImage}
          xStyle={service.contentCreatorX}
        />
      )}

      {content.publisherLight && service.publisherLightImage && (
        <ServiceDetailPublisherLight
          content={content.publisherLight}
          image={service.publisherLightImage}
          xStyle={service.publisherLightX}
          channelStyle={service.publisherLightChannel}
        />
      )}

      {content.marketStrategy && service.marketStrategyImage && (
        <ServiceDetailMarketStrategy content={content.marketStrategy} image={service.marketStrategyImage} />
      )}

      {content.channelStrategy && service.channelStrategyImage && (
        <ServiceDetailChannelStrategy content={content.channelStrategy} image={service.channelStrategyImage} />
      )}

      {content.channelLocal && service.channelLocalImage && (
        <ServiceDetailChannelLocal content={content.channelLocal} image={service.channelLocalImage} />
      )}

      {content.channelMarket && service.channelMarketImage && (
        <ServiceDetailChannelMarket content={content.channelMarket} image={service.channelMarketImage} />
      )}

      {content.channelGrowth && service.channelGrowthImage && (
        <ServiceDetailChannelGrowth content={content.channelGrowth} image={service.channelGrowthImage} />
      )}

      {content.channelWorkflow && service.channelWorkflowImage && (
        <ServiceDetailChannelWorkflow content={content.channelWorkflow} image={service.channelWorkflowImage} />
      )}

      {content.marketAccounts && service.marketAccountsImage && (
        <ServiceDetailMarketAccounts content={content.marketAccounts} image={service.marketAccountsImage} />
      )}

      {content.timingPerformance && service.timingPerformanceImage && (
        <ServiceDetailTimingPerformance content={content.timingPerformance} image={service.timingPerformanceImage} />
      )}

      {content.audience && service.audienceImage && (
        <ServiceDetailAudience content={content.audience} image={service.audienceImage} />
      )}

      {content.responses && service.responsesImage && (
        <ServiceDetailResponses content={content.responses} image={service.responsesImage} />
      )}

      {content.journey && service.journeyImage && (
        <ServiceDetailJourney content={content.journey} image={service.journeyImage} />
      )}

      {content.benefits && service.benefitsImages && (
        <ServiceDetailBenefits content={content.benefits} images={service.benefitsImages} />
      )}

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
        <ServiceDetailFocusedGrowth
          growth={content.focusedGrowth}
          images={service.focusedGrowthImages}
          xStyle={service.focusedGrowthX}
        />
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
          imageEnd={service.aboutImageEnd}
          highlightsImageSize={service.highlightsImageSize}
        />
      )}

      {content.process && <ServiceDetailProcess process={content.process} accordion={service.processAccordion} figma={service.processFigma} grid={service.processGrid} />}

      {content.ecosystem && service.ecosystemImage && (
        <ServiceDetailEcosystem content={content.ecosystem} image={service.ecosystemImage} />
      )}

      {content.matters && service.mattersImage && (
        <ServiceDetailMatters matters={content.matters} image={service.mattersImage} />
      )}

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
          plainText={service.contactPlainText}
          compact={service.contactCompact}
        />
      )}

      <FooterSection />
    </div>
  );
}
