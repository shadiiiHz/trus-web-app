import { useEffect, useRef } from "react";
import { siteConfig } from "@/config/site.config";
import DesignInMotion3D from "../templates/DesignInMotion3D";

type TemplateSectionProps = {
  onEnter?: () => void;
  onLeave?: () => void;
};

export function TemplateSection({ onEnter, onLeave }: TemplateSectionProps) {
  const { LeftWord, RightWord, templates } = siteConfig.templateCategories;
  // Refs
  const sectionRef = useRef<HTMLElement>(null);

  const ribbonTemplates = templates.All;

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEnter?.();
        } else {
          onLeave?.();
        }
      },
      {
        threshold: 0.6,
      },
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [onEnter, onLeave]);
  return (
    <>
      {/* Section */}
      <section
        id="templates"
        ref={sectionRef}
        className="relative group"
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #D9D9D9 100%)",
          overflow: "hidden",
        }}
        aria-label="Template Categories"
      >
        <div
          className="relative mx-auto w-full"
          style={{
            zIndex: 2,
          }}
        >
          {/* TEMPLATE */}
          <DesignInMotion3D
            templates={ribbonTemplates}
            pinTargetRef={sectionRef}
            LeftWord={LeftWord}
            RightWord={RightWord}
          />
        </div>
      </section>
    </>
  );
}

export default TemplateSection;
