import React from "react";
import ServiceLayout from "../../components/ServiceLayout.jsx";
import { servicesData } from "../../Data/servicesData.js";
import SEOHead from "../../components/seo/SEOHead.jsx";
import PakistanCoverage from "../../components/seo/PakistanCoverage.jsx";

const schemaConfig = {
  slug: "/ExtensiveResearch",
  name: "Legal Research Services in Pakistan",
  title: "Comprehensive Legal Research to Strengthen Your Legal Strategy in Pakistan",
  description:
    "Extensive legal research services covering statutes, case law, and precedents across Pakistan. Professional legal analysis for litigation, compliance, and strategic planning in Lahore, Karachi, Islamabad.",
  serviceType: "Legal Research",
  image: "https://faizalamfaizi.com/4. Online Extensive Research Services in Lahore Pakistan.webp",
  areaServed: [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Pakistan",
  ],
  keywords: [
    "legal research Pakistan", "legal analysis Lahore", "case law research Karachi",
    "legal precedents Islamabad", "statutory research Pakistan", "legal study services",
    "legal research near me Pakistan",
  ],
  audience: "Lawyers, businesses, and individuals needing legal research in Pakistan",
};

function ExtensiveResearch() {
  return (
    <>
      <SEOHead
        title="Legal Research Services in Pakistan | Comprehensive Legal Analysis Lahore, Karachi"
        description="Extensive legal research services covering statutes, case law, and precedents across Pakistan. Professional legal analysis for litigation, compliance, and strategic planning in Lahore, Karachi, Islamabad, Rawalpindi."
        keywords="legal research Pakistan, legal analysis Lahore, case law research Karachi, legal precedents Islamabad, statutory research Pakistan, legal study services, legal research near me Pakistan"
        canonical="/ExtensiveResearch"
        ogImage="/4.%20Online%20Extensive%20Research%20Services%20in%20Lahore%20Pakistan.webp"
      />
      <ServiceLayout
        content={servicesData.extensiveResearch}
        faqKey="extensiveResearch"
        schemaConfig={schemaConfig}
      />
      <PakistanCoverage serviceName="Legal Research Services" />
    </>
  );
}

export default ExtensiveResearch;
