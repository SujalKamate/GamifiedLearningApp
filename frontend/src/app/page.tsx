import Header from "@/components/sections/Header";
import HeroSection from "@/components/sections/HeroSection";
import ExploreGrid from "@/components/sections/ExploreGrid";
import AdvertisingBanner from "@/components/sections/AdvertisingBanner";
import CoursesSection from "@/components/sections/CoursesSection";
import MustExplore from "@/components/sections/MustExplore";
import Footer from "@/components/sections/Footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="w-full">
        <HeroSection />
        
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <ExploreGrid />
          <AdvertisingBanner />
        </div>
        
        <CoursesSection />
        
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <MustExplore />
        </div>
        
        <Footer />
      </div>
    </main>
  );
}