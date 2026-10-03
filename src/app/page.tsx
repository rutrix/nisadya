import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Events from '@/components/Events';
import Schedule from '@/components/Schedule';
import Stay from '@/components/Stay';
import Maps from '@/components/Maps';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import BackToTop from '@/components/BackToTop';
import JsonLd from '@/components/JsonLd';
import { getServerData } from '@/lib/server-data';

export default async function Home() {
    // Fetch all data on the server
    const serverData = await getServerData();

    return (
        <main className="relative">
            {/* Moved out of layout.tsx: this describes the fest, so it belongs
                on the homepage, not on /policy and /terms. It also keeps those
                two routes free of any sheet fetch. */}
            <JsonLd config={serverData.config} />
            <ScrollProgress />
            <Navbar config={serverData.config} events={serverData.events} />
            <Hero config={serverData.config} />
            <About config={serverData.config} />
            <Events initialEvents={serverData.events} />
            <Schedule initialSchedule={serverData.schedule} />
            <Stay config={serverData.config} />
            <Maps taxiContacts={serverData.config.taxi_contacts} />
            <Footer config={serverData.config} />
            <BackToTop />
        </main>
    );
}
