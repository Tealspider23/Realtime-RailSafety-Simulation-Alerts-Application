'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <motion.div
      className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-blue-700 p-4 shadow-md"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center">
        <img src="/train.svg" alt="TrainSafe Logo" className="h-8 mr-2 invert border border-spacing-3 border-double rounded-full border-white" />
        <h1 className="text-white text-xl font-semibold">TrainSafe</h1>
      </div>
      <div className="flex space-x-4">
        <Link href="/trackTrain" passHref>
          <Button variant="ghost" className="text-white hover:bg-blue-600 py-2 px-4 rounded-md">
            Map
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white hover:bg-blue-600 py-2 px-4 rounded-md">
              Info
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <DropdownMenuItem>
                  <p className="px-4 py-2 text-sm text-gray-600">
                    TrainSafe is a website that helps you track your train and get real-time updates about its location and schedule.
                  </p>
                </DropdownMenuItem>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};

export default Navbar;