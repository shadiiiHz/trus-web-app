import { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import { ServiceDetailHero } from "@/components/service-detail/ServiceDetailHero";
import { ServiceDetailAbout } from "@/components/service-detail/ServiceDetailAbout";
import { ServiceDetailProcess } from "@/components/service-detail/ServiceDetailProcess";
import { ServiceDetailStack } from "@/components/service-detail/ServiceDetailStack";
import { ServiceDetailFlexible } from "@/components/service-detail/ServiceDetailFlexible";
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

      {content.about && content.gain && content.highlights && (
        <ServiceDetailAbout
          about={content.about}
          gain={content.gain}
          highlights={content.highlights}
          glow={service.aboutGlow}
          aboutImageSize={service.aboutImageSize}
          highlightsImageSize={service.highlightsImageSize}
        />
      )}

      {content.process && <ServiceDetailProcess process={content.process} />}

      {content.automation && service.stackImage && (
        <ServiceDetailStack automation={content.automation} image={service.stackImage} />
      )}

      {content.flexible && service.flexibleImages && (
        <ServiceDetailFlexible flexible={content.flexible} images={service.flexibleImages} />
      )}

      {content.contact && (
        <ServiceDetailContact
          subject={getServiceName(service)}
          heading={content.contact.heading}
          description={content.contact.description}
          wide={content.contact.wide}
        />
      )}

      <FooterSection />
    </div>
  );
}
