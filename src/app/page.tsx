import { Navbar } from './Navbar';
import { OnlineHero } from './accueil/components/OnlineHero';
import { OnlineStats } from './accueil/components/OnlineStats';
import { CategoriesCards } from './accueil/components/CategoriesCards';
import { FeaturesGrid } from './accueil/components/FeaturesGrid';
import { FormationsGrid } from './accueil/components/FormationsGrid';
import FinanceSection from './accueil/components/FinanceSection';
import { AdmissionProcess } from './accueil/components/AdmissionProcess';
import { Events } from './accueil/components/Events';
import { Testimonials } from './accueil/components/Testimonials';
import { Formateur } from './accueil/components/Formateur';
import Partners from './accueil/components/Partners';
import { Improve } from './Improve';
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
      <Partners />
      <FinanceSection />
      <AdmissionProcess />
      <Events />
      <Formateur />
      <Testimonials />
      <Improve />
      <Footer />
    </main>
  );
}
