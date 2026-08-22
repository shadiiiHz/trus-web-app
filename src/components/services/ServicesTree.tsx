/**
 * Services page hero — eyebrow/heading/subtitle on the left, the animated
 * "Growth AI" circuit-tree diagram on the right. Each branch label is a
 * real in-page anchor (`#node-id`); the sections they'll eventually scroll
 * to don't exist yet, so clicks are inert until those are built.
 *
 * Pinned full-screen, matching the Home page hero (Hero.tsx): the section
 * fills the viewport (100svh) and its content is vertically centered within
 * that space, instead of sizing to its own content height.
 */
const TREE_SRC = "/services/trus-ai.svg";
export function ServicesTree() {
  return (
    <section
      aria-label="Tree"
      className="relative overflow-hidden flex items-center"
      style={{ background: "#FAFAFB", minHeight: "100svh" }}
    >
      <div className="mx-auto w-full max-w-330">
        <img
          src={TREE_SRC}
          alt="TruS Growth AI — connected services"
          className="absolute inset-0 h-full w-full"
          style={{ objectFit: "contain" }}
          draggable={false}
        />
      </div>
    </section>
  );
}

export default ServicesTree;
