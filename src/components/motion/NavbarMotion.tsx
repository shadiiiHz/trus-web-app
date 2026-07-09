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
      className="fixed top-0 left-0 w-full z-50"
    >
      {children}
    </motion.div>
  );
}