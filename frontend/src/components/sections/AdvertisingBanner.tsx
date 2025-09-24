import React from 'react';

const AdvertisingBanner = () => {
  return (
    <div className="my-16">
      <a
        href="https://www.geeksforgeeks.org/advertise-with-us/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col rounded-2xl bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 p-6 text-center text-white transition-all duration-500 ease-in-out hover:scale-[1.05] md:flex-row md:items-center md:justify-between md:p-10 md:text-left gap-6 md:gap-4 dark:from-purple-500 dark:via-purple-600 dark:to-purple-700 border border-transparent hover:border-white/20 shadow-lg hover:shadow-2xl overflow-hidden relative before:absolute before:inset-0 before:opacity-0 before:transition-all before:duration-500 before:hover:opacity-100 before:bg-gradient-to-br before:from-white/10 before:to-transparent"
      >
        <div>
          <p className="text-2xl font-semibold md:text-3xl">
            Interested in advertising with us?
          </p>
        </div>
        <div>
          <div className="inline-block cursor-pointer rounded-full bg-white/10 backdrop-blur-sm px-8 py-3 text-base font-bold font-blocky text-purple-50 transition-all hover:bg-white/20 hover:scale-105 hover:shadow-md border border-white/20">
            Get in touch
          </div>
        </div>
      </a>
    </div>
  );
};

export default AdvertisingBanner;