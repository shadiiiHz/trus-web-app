import { useState } from "react";

interface Field {
  readonly id: string;
  readonly label: string;
  readonly placeholder: string;
}

interface ServiceContactFormProps {
  fields: readonly Field[];
  submit: string;
  /** Pre-filled, read-only "Subject" field shown above the others. */
  subject: { label: string; value: string };
  className?: string;
  /** Mobile sizes from the Business Growth Figma (45px inputs, 63px message field); desktop is unchanged. */
  compact?: boolean;
  /** With `compact`: 44px inputs and a 53px message field on phones too (the YouTube page's Figma). */
  tightMobile?: boolean;
}

const LABEL = "font-body text-[16px] font-normal leading-[19px] tracking-[-0.64px] text-[#070606]";
const CONTROL =
  "block w-full border-0 border-b border-b-[rgba(112,112,117,0.3)] bg-transparent font-body font-normal text-[#070606] outline-none placeholder:text-[#707075] placeholder:opacity-100 focus:border-b-[rgba(91,43,185,0.5)] lg:text-[16px] lg:tracking-[-0.48px]";
const TEXT_DEFAULT = "text-[14px] leading-[17px] lg:leading-[19px]";
const TEXT_COMPACT = "text-[16px] leading-[22px] lg:leading-[19px]";

/**
 * Service-page contact form (Figma): flat fields on a 20px rhythm, 44px inputs
 * with a hairline underline, and a 125×40 purple submit button.
 */
export function ServiceContactForm({ fields, submit, subject, className, compact, tightMobile }: ServiceContactFormProps) {
  const fieldGap = "gap-1";
  const inputSize = compact
    ? `${TEXT_COMPACT} ${tightMobile ? "h-11 pt-2.5" : "h-[46px] pt-3"} lg:h-11 lg:pt-[12.5px]`
    : `${TEXT_DEFAULT} h-11 pt-3 lg:pt-[12.5px]`;
  const textareaSize = compact
    ? `${TEXT_COMPACT} ${tightMobile ? "h-[53px] pt-2.5" : "h-16 pt-3"} lg:h-[53px] lg:pt-2.5`
    : `${TEXT_DEFAULT} h-[104px] pt-3 lg:h-[53px] lg:pt-2.5`;
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.id, ""])),
  );
  const set = (id: string, val: string) => setValues((prev) => ({ ...prev, [id]: val }));

  return (
    <form
      className={["flex flex-col gap-5", className].filter(Boolean).join(" ")}
      onSubmit={(e) => e.preventDefault()}
    >
      <div className={`flex flex-col ${fieldGap}`}>
        <label htmlFor="contact-subject" className={LABEL}>
          {subject.label}
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          readOnly
          value={subject.value}
          className={`${CONTROL} ${inputSize}`}
        />
      </div>

      {fields.map((field) => (
        <div key={field.id} className={`flex flex-col ${fieldGap}`}>
          <label htmlFor={`contact-${field.id}`} className={LABEL}>
            {field.label}
          </label>
          {field.id === "message" ? (
            <textarea
              id={`contact-${field.id}`}
              name={field.id}
              placeholder={field.placeholder}
              value={values[field.id]}
              onChange={(e) => set(field.id, e.target.value)}
              className={`${CONTROL} resize-none ${textareaSize}`}
            />
          ) : (
            <input
              id={`contact-${field.id}`}
              name={field.id}
              type={field.id === "email" ? "email" : "text"}
              placeholder={field.placeholder}
              value={values[field.id]}
              onChange={(e) => set(field.id, e.target.value)}
              className={`${CONTROL} ${inputSize}`}
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        className={`flex h-10 ${compact ? "w-[127px]" : "w-[125px]"} items-center justify-center gap-1 rounded-md bg-[#5B2BB9] px-6 py-2.5 font-body text-[14px] font-normal leading-5 text-white shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(0,0,0,0.18),inset_0_-2px_0_rgba(0,0,0,0.05)] transition-[filter] hover:brightness-110`}
      >
        {submit}
      </button>
    </form>
  );
}

export default ServiceContactForm;
