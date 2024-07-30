import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HomePage = () => {
  return (
    <section className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Train Live Location Alerts
        </h1>
        <p className="text-lg font-medium text-gray-500 mt-4">
          Real-time Simulation of Trains to prevent Accidents
        </p>
      </div>

      <div className="flex flex-wrap justify-center mt-12">
        <div className="w-full lg:w-1/2 xl:w-1/3 p-6 text-lg font-medium text-gray-500">
          <h2 className="text-3xl text-gray-900 leading-tight">Our Test Site</h2>
          <p>Our Test site is based on Odisha Map.</p>
        </div>
        <div className="w-full lg:w-1/2 xl:w-1/3 p-6 text-lg font-medium text-gray-500">
          <h2 className="text-3xl text-gray-900 leading-tight">Features</h2>
          <ul>
            <li>Live location of trains on the map.</li>
            <li>Speed of the trains.</li>
            <li>Alerts for the trains.</li>
            <li>Real-time simulation of the trains.</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <Image
          src="/orissa-railway-map.gif"
          alt="Odisha Map"
          width={600}
          height={600}
          className="border border-black rounded-xl"
        />
      </div>

      <div className="flex justify-center mt-12">
        <Button>
          <Link href="/trackTrain">
            <p>View Map</p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default HomePage;