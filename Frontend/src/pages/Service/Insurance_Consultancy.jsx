import React from "react";
import ServiceLayout from "../../components/ServiceLayout.jsx";
import { servicesData } from "../../Data/servicesData.js";
import SEOHead from "../../components/seo/SEOHead.jsx";
import PakistanCoverage from "../../components/seo/PakistanCoverage.jsx";

const schemaConfig = {
  slug: "/insurance_consultancy",
  name: "Insurance Consultant Services in Pakistan",
  title: "Professional Insurance Consultancy and Risk Protection Services in Pakistan",
  description:
    "Professional insurance consultancy and risk protection services across Pakistan. Expert insurance advisory for life, health, property, and business coverage in Lahore, Karachi, Islamabad, Rawalpindi.",
  serviceType: "Insurance Consultancy",
  image: "https://faizalamfaizi.com/1-Best-Legal_Consultant-near-me.webp",
  areaServed: [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Pakistan",
  ],
  keywords: [
    "insurance consultant Pakistan", "insurance advisory Lahore", "insurance services Karachi",
    "risk management Islamabad", "insurance expert Pakistan", "insurance planning Rawalpindi",
    "best insurance consultant near me Pakistan",
  ],
  audience: "Individuals and businesses needing insurance advisory in Pakistan",
};

function Insurance_Consultancy() {
  return (
    <>
      <SEOHead
        title="Insurance Consultant in Pakistan | Insurance Advisory Services Lahore, Karachi, Islamabad"
        description="Professional insurance consultancy and risk protection services across Pakistan. Expert insurance advisory for life, health, property, and business coverage in Lahore, Karachi, Islamabad, Rawalpindi."
        keywords="insurance consultant Pakistan, insurance advisory Lahore, insurance services Karachi, risk management Islamabad, insurance expert Pakistan, insurance planning Rawalpindi, best insurance consultant near me Pakistan"
        canonical="/insurance_consultancy"
        ogImage="/1-Best-Legal_Consultant-near-me.webp"
      />
      <ServiceLayout
        content={servicesData.InsuranceConsultancy}
        faqKey="InsuranceConsultancy"
        schemaConfig={schemaConfig}
      />
      <PakistanCoverage serviceName="Insurance Consultancy Services" />
    </>
  );
}

export default Insurance_Consultancy;
