import { memo, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site.config";
import DesignInMotion3D from "../templates/DesignInMotion3D";
import TemplateMenuFAB from "./TemplateMenuFAB";

type TemplateSectionProps = {
  onEnter?: () => void;
  onLeave?: () => void;
  onReady?: () => void;
};

function TemplateSection({ onEnter, onLeave, onReady }: TemplateSectionProps) {
  const { LeftWord, RightWord, tagline, sectionDes, templates , seeMore } =
    siteConfig.templateCategories;
  // Refs
  const sectionRef = useRef<HTMLElement>(null);

  // The main Navbar hides itself while this section is in view (see App.tsx),
  // so the floating menu tab is the only way to reach nav links here.
  const [isActive, setIsActive] = useState(false);

  const ribbonTemplates = templates.All;

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
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
          background: "#C3C3C3",
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
            tagline={tagline}
            sectionDes={sectionDes}
            seeMore={seeMore}
            onReady={onReady}
          />
        </div>
      </section>

      <TemplateMenuFAB active={isActive} />
    </>
  );
}

export default memo(TemplateSection);
