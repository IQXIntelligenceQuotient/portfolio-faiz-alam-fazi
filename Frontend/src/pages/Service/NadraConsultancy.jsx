import React from "react";
import ServiceLayout from "../../components/ServiceLayout.jsx";
import { servicesData } from "../../Data/servicesData.js";
import SEOHead from "../../components/seo/SEOHead.jsx";
import PakistanCoverage from "../../components/seo/PakistanCoverage.jsx";

const schemaConfig = {
  slug: "/nadra_consultancy",
  name: "NADRA Consultant Services in Pakistan",
  title: "Professional NADRA Documentation Consultancy Services in Pakistan",
  description:
    "Professional NADRA consultancy services for CNIC applications, corrections, B-Forms, and family registration across Pakistan. Expert NADRA documentation support in Lahore, Karachi, Islamabad, Rawalpindi.",
  serviceType: "NADRA Consultancy",
  image: "https://faizalamfaizi.com/13. Online Nadra Consultant in Lahore Pakistan.webp",
  areaServed: [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Pakistan",
  ],
  keywords: [
    "NADRA consultant Pakistan", "CNIC services Lahore", "NADRA documentation Karachi",
    "B-Form registration Islamabad", "family registration Pakistan", "NADRA help Rawalpindi",
    "NADRA consultant near me Pakistan",
  ],
  audience: "Individuals needing NADRA documentation services in Pakistan",
};

function NadraConsultancy() {
  return (
    <>
      <SEOHead
        title="NADRA Consultant in Pakistan | CNIC, B-Form & Documentation Services Lahore, Karachi"
        description="Professional NADRA consultancy services for CNIC applications, corrections, B-Forms, and family registration across Pakistan. Expert NADRA documentation support in Lahore, Karachi, Islamabad, Rawalpindi."
        keywords="NADRA consultant Pakistan, CNIC services Lahore, NADRA documentation Karachi, B-Form registration Islamabad, family registration Pakistan, NADRA help Rawalpindi, NADRA consultant near me Pakistan"
        canonical="/nadra_consultancy"
        ogImage="/13.%20Online%20Nadra%20Consultant%20in%20Lahore%20Pakistan.webp"
      />
      <ServiceLayout
        content={servicesData.NadraConsultancy}
        faqKey="NadraConsultancy"
        schemaConfig={schemaConfig}
      />
      <PakistanCoverage serviceName="NADRA Consultancy Services" />
    </>
  );
}

export default NadraConsultancy;
