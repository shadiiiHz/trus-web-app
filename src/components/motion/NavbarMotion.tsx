import { motion } from "framer-motion";

type NavbarMotionProps = {
  children: React.ReactNode;
  hidden: boolean;
};

export function NavbarMotion({
  children,
  hidden,
}: NavbarMotionProps) {
  return (
    <motion.div
      animate={{
        y: hidden ? -100 : 0,
        opacity: hidden ? 0 : 1,
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
      }}
       style={{
        // Forces Firefox to promote this to its own GPU composite layer
        // up front, instead of deciding mid-animation — which is what
        // causes the jitter when a backdrop-filter/blur child needs to
        // be re-rasterized on every transform frame in Firefox.
        willChange: "transform, opacity",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
      className="fixed top-0 left-0 w-full z-50"
    >
      {children}
    </motion.div>
  );
}