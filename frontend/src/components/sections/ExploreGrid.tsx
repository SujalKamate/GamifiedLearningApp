import React from 'react';
import Link from 'next/link';

const exploreItems = [
  {
    title: "Adaptive Coding Quests",
    description: "AI-powered challenges that grow with your skills",
    href: "/quiz/coding",
    lightGradient: "from-blue-400 to-blue-600",
    darkGradient: "from-blue-500 to-blue-700",
    icon: "💻"
  },
  {
    title: "Vocabulary Mastery",
    description: "Build your word power through gamified lessons",
    href: "/quiz/vocab",
    lightGradient: "from-green-400 to-green-600",
    darkGradient: "from-green-500 to-green-700",
    icon: "📚"
  },
  {
    title: "Finance Simulations",
    description: "Learn money management with real-world scenarios",
    href: "/quiz/finance",
    lightGradient: "from-purple-400 to-purple-600",
    darkGradient: "from-purple-500 to-purple-700",
    icon: "💰"
  },
  // Add more if needed, but focus on domains
];

const ExploreGrid = () => {
  return (
    <div className="bg-background/50 backdrop-blur-sm">
      <section className="container mx-auto px-6 py-12 md:py-16">
        <h2 className="text-4xl font-bold mb-8 font-blocky text-center tracking-wide text-foreground drop-shadow-sm">
          Choose Your Learning Path
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exploreItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-col justify-between p-6 rounded-2xl text-white shadow-lg hover:shadow-xl hover:scale-[1.05] transform transition-all duration-500 border border-transparent ${item.lightGradient} dark:${item.darkGradient} hover:from-[hsl(var(--primary))] dark:hover:from-[hsl(var(--primary))] overflow-hidden relative before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:hover:opacity-100 before:bg-gradient-to-t before:from-black/20 before:to-transparent`}
            >
              <div className="mb-4 relative z-10">
                <div className="text-5xl mb-2 drop-shadow-md">{item.icon}</div>
                <h3 className="text-2xl font-bold font-blocky mb-2 leading-tight">{item.title}</h3>
                <p className="text-white/90 text-base leading-relaxed">{item.description}</p>
              </div>
              <div className="mt-auto flex items-center w-fit cursor-pointer text-sm font-bold font-blocky bg-white/10 backdrop-blur-sm border border-white/30 rounded-full py-3 px-6 transition-all hover:bg-white/20 hover:scale-105 hover:shadow-md">
                Start Now
                <span className="ml-2 text-lg font-blocky">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExploreGrid;