import { Suspense } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { FormationHero } from './components/FormationHero';
import FormationsPageContent from './components/FormationsPageContent';

function FormationsPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F5E4]">
      {/* Skeleton pour les filtres */}
      <div className="bg-[#032622] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Skeleton pour la grille */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-300 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FormationsPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <FormationHero />
      <Suspense fallback={<FormationsPageSkeleton />}>
        <FormationsPageContent />
      </Suspense>
      <Footer />
    </main>
  );
}
