import React from "react";
import ServiceLayout from "../../components/ServiceLayout.jsx";
import { servicesData } from "../../Data/servicesData.js";
import SEOHead from "../../components/seo/SEOHead.jsx";
import PakistanCoverage from "../../components/seo/PakistanCoverage.jsx";

const schemaConfig = {
  slug: "/company_formation",
  name: "Company Registration for Software Houses, Startups and IT Companies in Pakistan",
  title: "Company Formation for Software Houses, Startups, BPO Offices and IT Companies",
  description:
    "Company formation and business registration coordination for software houses, SaaS businesses, IT companies, BPO offices, call centers, startups, e-commerce ventures, and digital agencies in Lahore, Punjab, and Pakistan.",
  serviceType: "Company Formation",
  image: "https://faizalamfaizi.com/9. Online Company Formation Services in Lahore Pakistan.webp",
  areaServed: [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Pakistan",
  ],
  keywords: [
    "company formation Pakistan", "business registration Lahore", "Legal services for startups Lahore",
    "company registration for software houses Pakistan", "corporate compliance for technology companies Pakistan",
    "BPO company registration Pakistan", "call center company registration Lahore",
  ],
  audience: "Entrepreneurs, startups, and businesses registering companies in Pakistan",
};

function Company_Formation() {
  return (
    <>
      <SEOHead
        title="Company Registration Lahore for Software Houses, Startups and IT Companies"
        description="Company formation and business registration coordination for software houses, SaaS businesses, IT companies, BPO offices, call centers, startups, e-commerce ventures, and digital agencies in Lahore, Punjab, and Pakistan."
        keywords="company formation Pakistan, business registration Lahore, Legal services for startups Lahore, company registration for software houses Pakistan, corporate compliance for technology companies Pakistan, BPO company registration Pakistan, call center company registration Lahore"
        canonical="/company_formation"
        ogImage="/9.%20Online%20Company%20Formation%20Services%20in%20Lahore%20Pakistan.webp"
      />
      <ServiceLayout
        content={servicesData.companyFormation}
        faqKey="companyFormation"
        schemaConfig={schemaConfig}
      />
      <PakistanCoverage serviceName="Company Formation Services" />
    </>
  );
}

export default Company_Formation;
