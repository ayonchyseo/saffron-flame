import { Hero } from "@/components/sections/Hero";
import { Navigation } from "@/components/Navigation";
import { Story } from "@/components/sections/Story";
import { Menu } from "@/components/sections/Menu";
import { Signature } from "@/components/sections/Signature";
import { Testimonials } from "@/components/sections/Testimonials";
import { Reservation } from "@/components/sections/Reservation";
import { Location } from "@/components/sections/Location";
import { Footer } from "@/components/sections/Footer";

export default function Page() {
  return (
    <>
      <Navigation />
      <main className="relative">
        <Hero />
        <Story />
        <Menu />
        <Signature />
        <Testimonials />
        <Reservation />
        <Location />
      </main>
      <Footer />
    </>
  );
}
