'use client';

import React from 'react';
import { Drawer } from '@/components/ui/drawer';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Sidebar: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    return (
      <Drawer open={open} onClose={onClose}>
        <motion.div
          className="p-4 w-full h-full bg-gradient-to-b from-blue-500 to-blue-700 text-white"
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <nav>
            <ul>
              <li className="mb-4">
                <Link href="/" passHref>
                  <div onClick={onClose} className="block p-2 hover:bg-blue-600 rounded">Home</div>
                </Link>
              </li>
              <li className="mb-4">
                <Link href="/pnrcheck" passHref>
                  <div onClick={onClose} className="block p-2 hover:bg-blue-600 rounded">PNR Check</div>
                </Link>
              </li>
              <li className="mb-4">
                <Link href="/tracktrain" passHref>
                  <div onClick={onClose} className="block p-2 hover:bg-blue-600 rounded">Track your Train </div>
                </Link>
              </li>
            </ul>
          </nav>
        </motion.div>
      </Drawer>
    );
  };
  
  export default Sidebar;