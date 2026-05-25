import { AnimatePresence, motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] } },
  exit:    { opacity: 0, y: -6,  transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } },
};

export default function PageTransition({ children, locationKey }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={locationKey} variants={variants} initial="initial" animate="animate" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
