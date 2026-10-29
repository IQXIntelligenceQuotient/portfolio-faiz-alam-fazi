import React from "react";
import ServiceLayout from "../../components/ServiceLayout.jsx";
import { servicesData } from "../../Data/servicesData.js";
import SEOHead from "../../components/seo/SEOHead.jsx";
import PakistanCoverage from "../../components/seo/PakistanCoverage.jsx";

const schemaConfig = {
  slug: "/intellectual_property",
  name: "IP Protection for Software Companies and Technology Businesses in Pakistan",
  title: "IP Protection, Source Code Ownership and Technology Rights in Pakistan",
  description:
    "IP protection, trademark and copyright support, source code ownership documentation, NDA and IP assignment review, and technology-sector rights coordination for software houses, startups, IT companies, and foreign clients working with Pakistani vendors.",
  serviceType: "Intellectual Property",
  image: "https://faizalamfaizi.com/12. Online Trademark, Copyright, Patent Services in Lahore Pakistan.webp",
  areaServed: [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Pakistan",
  ],
  keywords: [
    "IP lawyer Lahore", "IP protection for software companies Pakistan", "Source code ownership dispute Pakistan",
    "NDA and IP agreement lawyer Pakistan", "trademark registration Pakistan",
    "copyright protection Lahore", "intellectual property Pakistan",
  ],
  audience: "Businesses, creators, and innovators needing IP protection in Pakistan",
};

function Intellectual_Property() {
  return (
    <>
      <SEOHead
        title="IP Lawyer Lahore for Software Companies | Source Code & IP Protection Pakistan"
        description="Legal Bridge LLP® coordinates IP protection, trademark and copyright support, source code ownership documentation, NDA and IP assignment review, and technology-sector rights documentation for software houses, startups, IT companies, and foreign clients working with Pakistani vendors."
        keywords="IP lawyer Lahore, IP protection for software companies Pakistan, Source code ownership dispute Pakistan, NDA and IP agreement lawyer Pakistan, trademark registration Pakistan, copyright protection Lahore, intellectual property Pakistan"
        canonical="/intellectual_property"
        ogImage="/12.%20Online%20Trademark%2C%20Copyright%2C%20Patent%20Services%20in%20Lahore%20Pakistan.webp"
      />
      <ServiceLayout
        content={servicesData.intellectualProperty}
        faqKey="intellectualProperty"
        schemaConfig={schemaConfig}
      />
      <PakistanCoverage serviceName="Trademark, Copyright & Patent Services" />
    </>
  );
}

export default Intellectual_Property;
