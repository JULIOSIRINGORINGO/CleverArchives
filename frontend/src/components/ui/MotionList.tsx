"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, memo } from "react";
import { DESIGN } from "@/config/design-system";

interface MotionListProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
}

export const MotionList = memo(({ children, className, stagger = DESIGN.ANIM.STAGGER_DELAY }: MotionListProps) => (
  <AnimatePresence mode="popLayout" initial={false}>
    <div className={className}>
      {children}
    </div>
  </AnimatePresence>
));

interface MotionItemProps {
  children: ReactNode;
  index: number;
  className?: string;
  delay?: number;
}

export const MotionItem = memo(({ children, index, className, delay = DESIGN.ANIM.STAGGER_DELAY }: MotionItemProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: DESIGN.ANIM.EXIT_SCALE, transition: { duration: 0.1 } }}
    transition={{ 
      delay: index * delay,
      type: "spring",
      stiffness: 300,
      damping: 30
    }}
    className={className}
  >
    {children}
  </motion.div>
));

MotionList.displayName = "MotionList";
MotionItem.displayName = "MotionItem";
