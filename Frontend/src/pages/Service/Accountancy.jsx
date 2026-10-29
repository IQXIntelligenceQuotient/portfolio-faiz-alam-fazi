import React from "react";
import ServiceLayout from "../../components/ServiceLayout.jsx";
import { servicesData } from "../../Data/servicesData.js";
import SEOHead from "../../components/seo/SEOHead.jsx";
import PakistanCoverage from "../../components/seo/PakistanCoverage.jsx";

const schemaConfig = {
  slug: "/accountancy",
  name: "Accountancy Services in Pakistan",
  title: "Professional Accountancy Services for Accurate Financial Management in Pakistan",
  description:
    "Professional accountancy services for accurate financial management across Pakistan. Expert bookkeeping, financial reporting, and accounting support in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad.",
  serviceType: "Accountancy",
  image: "https://faizalamfaizi.com/11. Online Accountancy Services in Lahore Pakistan.webp",
  areaServed: [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Pakistan",
  ],
  keywords: [
    "accountancy services Pakistan", "accounting Lahore", "bookkeeping Karachi",
    "financial services Islamabad", "accountant Pakistan", "accounting firm Rawalpindi",
    "best accountant near me Pakistan",
  ],
  audience: "Businesses and individuals needing accountancy services in Pakistan",
};

function Accountancy() {
  return (
    <>
      <SEOHead
        title="Accountancy Services in Pakistan | Professional Accounting Lahore, Karachi, Islamabad"
        description="Professional accountancy services for accurate financial management across Pakistan. Expert bookkeeping, financial reporting, and accounting support in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad."
        keywords="accountancy services Pakistan, accounting Lahore, bookkeeping Karachi, financial services Islamabad, accountant Pakistan, accounting firm Rawalpindi, best accountant near me Pakistan"
        canonical="/accountancy"
        ogImage="/11.%20Online%20Accountancy%20Services%20in%20Lahore%20Pakistan.webp"
      />
      <ServiceLayout
        content={servicesData.accountancyServices}
        faqKey="accountancyServices"
        schemaConfig={schemaConfig}
      />
      <PakistanCoverage serviceName="Accountancy Services" />
    </>
  );
}

export default Accountancy;
