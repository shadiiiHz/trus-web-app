import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { FooterSection } from "@/components/sections/FooterSection";
import {
  SERVICE_DETAILS,
  getServiceContent,
  getServiceName,
  serviceDetailPath,
} from "@/config/serviceDetails.config";

/** TEMPORARY `/services-demo` — card index of the service detail pages, for demos. */
export default function ServiceDetailDemoPage() {
  const services = SERVICE_DETAILS.filter((s) => getServiceContent(s));

  return (
    <div className="bg-brand-white min-h-screen font-body antialiased">
      <Navbar />
      <main className="pt-21 lg:pt-18">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16">
          <h1 className="mb-8 text-3xl font-bold lg:text-4xl">Service pages demo</h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.slug}
                to={serviceDetailPath(service.slug)}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:shadow-lg"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={service.heroImage}
                    alt={getServiceName(service)}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{getServiceName(service)}</h2>
                  <p className="text-sm text-black/50">{serviceDetailPath(service.slug)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}
