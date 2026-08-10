import { forwardRef } from "react";
import { motion } from "motion/react";

const AnimatedPopup = forwardRef(function AnimatedPopup(
    {
        // Prevents layout from being affected by wrapping the children in a container
        children,
        className = "",
        as = "div",
    },
    // DOM mode from child, offclick function still works
    ref
) {
    // as == "div" -> motion.div
    const MotionComponent = motion[as];

    return (
        <MotionComponent
            ref={ref}
            className={className}
            initial={{
                opacity: 0,
                scale: 0.95,
                y: 15,
            }}
            animate={{
                opacity: 1,
                scale: 1,
                y: 0,
            }}
            transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            {/* children is default naam wat react gee om te verwys na alles binne houer in ouer komponent */}
            {children}
        </MotionComponent>
    );
});

export default AnimatedPopup;