import React from "react";
import ServiceLayout from "../../components/ServiceLayout.jsx";
import { servicesData } from "../../Data/servicesData.js";
import SEOHead from "../../components/seo/SEOHead.jsx";
import PakistanCoverage from "../../components/seo/PakistanCoverage.jsx";

const schemaConfig = {
  slug: "/DocumentDrafting",
  name: "Technology Contract, NDA, IP Assignment and Legal Documentation Services in Pakistan",
  title: "Technology Contracts, NDA, IP Assignment and Legal Documentation in Pakistan",
  description:
    "Legal drafting and review for software development agreements, NDAs, IP assignment documents, technical annexes, source code ownership terms, vendor agreements, employment contracts, confidentiality agreements, legal notices, and technology documentation in Lahore and Pakistan.",
  serviceType: "Technology Contract and Legal Documentation",
  image: "https://faizalamfaizi.com/3. Online Document Drafting and Review in Lahore Pakistan.webp",
  areaServed: [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Pakistan",
  ],
  keywords: [
    "NDA and IP agreement lawyer Pakistan", "Software development contract lawyer Pakistan",
    "Technology contract lawyer Lahore", "Call center legal documentation Lahore",
    "Source code ownership dispute Pakistan", "legal document review Lahore",
    "contract drafting Pakistan",
  ],
  audience: "Individuals, startups, and businesses needing legal documents in Pakistan",
};

function DocumentDrafting() {
  return (
    <>
      <SEOHead
        title="Technology Contracts, NDA & IP Agreements Pakistan | Legal Documentation Lahore"
        description="Legal Bridge LLP® drafts and reviews software development agreements, NDAs, IP assignment documents, technical annexes, source code ownership terms, vendor agreements, employment contracts, confidentiality agreements, legal notices, and technology documentation in Lahore and Pakistan."
        keywords="NDA and IP agreement lawyer Pakistan, Software development contract lawyer Pakistan, Technology contract lawyer Lahore, Call center legal documentation Lahore, Source code ownership dispute Pakistan, legal document review Lahore, contract drafting Pakistan"
        canonical="/DocumentDrafting"
        ogImage="/3.%20Online%20Document%20Drafting%20and%20Review%20in%20Lahore%20Pakistan.webp"
      />
      <ServiceLayout
        content={servicesData.documentDrafting}
        faqKey="documentDrafting"
        schemaConfig={schemaConfig}
      />
      <PakistanCoverage serviceName="Document Drafting & Review Services" />
    </>
  );
}

export default DocumentDrafting;
