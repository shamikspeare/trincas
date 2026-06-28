import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const FadeIn = ({ children, delay = 0, duration = 0.7, y = 30, className = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
            transition={{ duration, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export default FadeIn;
