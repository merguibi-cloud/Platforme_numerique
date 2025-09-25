import { Navbar } from './Navbar';
import { OnlineHero } from './accueil/components/OnlineHero';
import { OnlineStats } from './accueil/components/OnlineStats';
import { CategoriesCards } from './accueil/components/CategoriesCards';
import { FeaturesGrid } from './accueil/components/FeaturesGrid';
import { FormationsGrid } from './accueil/components/FormationsGrid';
import { Footer } from './Footer';
export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <OnlineHero />
      <OnlineStats />
      <FeaturesGrid />
      <CategoriesCards />
      <FormationsGrid />
      <Footer />
    </main>
  );
}
