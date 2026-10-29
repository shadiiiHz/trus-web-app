import { FadeIn } from "@/components/motion/FadeIn";
import type { ServiceDetailMarketAccounts as MarketAccountsContent } from "@/config/serviceDetails.config";
import { renderRichText } from "@/components/service-detail/richText";

const BODY = "font-body text-[16px] leading-[22px] text-white";
const H2 =
  "font-hero text-[26px] font-bold leading-[29px] text-white lg:text-[32px] lg:leading-[1.1] lg:capitalize";
const H3 =
  "font-hero text-[26px] font-bold leading-[29px] text-white lg:flex lg:min-h-10 lg:items-center lg:text-[32px] lg:leading-[22px] lg:tracking-[-0.5px] lg:capitalize";

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="list-disc pl-6 text-left">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Dark "multilingual strategy" block: how each language version is adapted, separate accounts for separate markets
 * (with examples), then an image beside a "short post or thread?" text. Rendered only for
 * services whose copy defines `marketAccounts`.
 */
export function ServiceDetailMarketAccounts({
  content,
  image,
}: {
  content: MarketAccountsContent;
  image: string;
}) {
  return (
    <section
      aria-labelledby="service-market-accounts-heading"
      className="bg-[#070606] px-5 py-14 text-white lg:flex lg:min-h-[900px] lg:flex-col lg:justify-center lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-[1064px] flex-col gap-10">
        <FadeIn direction="up">
          <div className="flex flex-col gap-10 lg:gap-4">
            <div className="flex flex-col gap-4">
              <h2 id="service-market-accounts-heading" className={H2}>
                {content.heading}
              </h2>
              <div className={`text-justify ${BODY}`}>
                <p className="font-bold">{content.lead}</p>
                <p>{content.intro}</p>
              </div>
              <div className={`flex flex-col gap-4 lg:gap-0 ${BODY}`}>
                <p>{content.adaptHeading}</p>
                <Bullets items={content.adaptItems} />
                <p className="text-justify">{content.adaptOutro}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 lg:gap-2">
              <h3 className={H3}>{content.accountsHeading}</h3>
              <p className={`text-justify ${BODY}`}>{content.accountsIntro}</p>
              <div className={`text-justify ${BODY}`}>
                {renderRichText(content.accountsExamples)}
              </div>
              <p className={`text-justify ${BODY}`}>{content.accountsOutro}</p>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.1}>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
            <img
              src={image}
              alt={content.imageAlt}
              loading="lazy"
              className="h-[212px] w-full shrink-0 rounded-lg object-cover [object-position:75%_center] lg:h-[388px] lg:w-[414px] lg:[object-position:74%_center] lg:rounded-2xl"
            />
            <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1">
              <h3 className="font-hero text-[26px] font-bold leading-[29px] text-white lg:whitespace-nowrap lg:text-[32px] lg:leading-[42px]">
                {content.formatHeading}
              </h3>
              <div className={`flex flex-col gap-4 lg:gap-0 ${BODY}`}>
                <div className="text-justify lg:text-left">
                  {renderRichText(content.formatText)}
                </div>
                <Bullets items={content.formatItems} />
                <p className="text-justify lg:text-left">
                  {content.formatOutro}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default ServiceDetailMarketAccounts;
