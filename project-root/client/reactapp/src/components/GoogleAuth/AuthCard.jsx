/* eslint-disable no-unused-vars */

import { motion } from 'framer-motion';

export default function AuthCard({ children }) {
    return(
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className='w-full max-w-md bg-[#121212] border-neutral-800 rounded-2xl p-8 shadow-xl flex-auto'>
                {children}
            </motion.div>
    )
}