import React from "react";
import ServiceLayout from "../../components/ServiceLayout.jsx";
import { servicesData } from "../../Data/servicesData.js";
import SEOHead from "../../components/seo/SEOHead.jsx";
import PakistanCoverage from "../../components/seo/PakistanCoverage.jsx";

const schemaConfig = {
  slug: "/visit_visa_consultation",
  name: "Visit Visa Consultation Services in Pakistan",
  title: "Professional Visit Visa Consultation and Application Support in Pakistan",
  description:
    "Professional visit visa consultation and application support services across Pakistan. Expert guidance for visa requirements, documentation, and application strategy in Lahore, Karachi, Islamabad, Rawalpindi.",
  serviceType: "Visa Consultation",
  image: "https://faizalamfaizi.com/1-Best-Legal_Consultant-near-me.webp",
  areaServed: [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Pakistan",
  ],
  keywords: [
    "visit visa consultant Pakistan", "visa application Lahore", "visa services Karachi",
    "visa consultation Islamabad", "visa help Pakistan", "visa documentation Rawalpindi",
    "visit visa consultant near me Pakistan",
  ],
  audience: "Individuals and families applying for visit visas in Pakistan",
};

function Visit_Visa_Consultation() {
  return (
    <>
      <SEOHead
        title="Visit Visa Consultation in Pakistan | Visa Application Support Lahore, Karachi, Islamabad"
        description="Professional visit visa consultation and application support services across Pakistan. Expert guidance for visa requirements, documentation, and application strategy in Lahore, Karachi, Islamabad, Rawalpindi."
        keywords="visit visa consultant Pakistan, visa application Lahore, visa services Karachi, visa consultation Islamabad, visa help Pakistan, visa documentation Rawalpindi, visit visa consultant near me Pakistan"
        canonical="/visit_visa_consultation"
        ogImage="/1-Best-Legal_Consultant-near-me.webp"
      />
      <ServiceLayout
        content={servicesData.VisitVisaConsultation}
        faqKey="VisitVisaConsultation"
        schemaConfig={schemaConfig}
      />
      <PakistanCoverage serviceName="Visit Visa Consultation Services" />
    </>
  );
}

export default Visit_Visa_Consultation;
