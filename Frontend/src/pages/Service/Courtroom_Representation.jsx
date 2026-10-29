import React from "react";
import ServiceLayout from "../../components/ServiceLayout.jsx";
import { servicesData } from "../../Data/servicesData.js";
import SEOHead from "../../components/seo/SEOHead.jsx";
import PakistanCoverage from "../../components/seo/PakistanCoverage.jsx";

const schemaConfig = {
  slug: "/Courtroom_Representation",
  name: "Courtroom Representation Services in Pakistan",
  title: "Professional Courtroom Representation for Litigation and Legal Disputes in Pakistan",
  description:
    "Expert courtroom representation and litigation services across Pakistan. Professional legal advocacy in courts of Lahore, Karachi, Islamabad, Rawalpindi for civil disputes, business conflicts, and legal claims.",
  serviceType: "Courtroom Litigation",
  image: "https://faizalamfaizi.com/6. Online Courtroom Representation in Lahore Pakistan.webp",
  areaServed: [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Pakistan",
  ],
  keywords: [
    "courtroom representation Pakistan", "litigation services Lahore", "court lawyer Karachi",
    "legal advocacy Islamabad", "trial lawyer Pakistan", "court representation Rawalpindi",
    "courtroom lawyer near me Pakistan",
  ],
  audience: "Individuals and businesses involved in court litigation in Pakistan",
};

function CourtroomRepresentation() {
  return (
    <>
      <SEOHead
        title="Courtroom Representation in Pakistan | Professional Litigation Lahore, Karachi, Islamabad"
        description="Expert courtroom representation and litigation services across Pakistan. Professional legal advocacy in courts of Lahore, Karachi, Islamabad, Rawalpindi for civil disputes, business conflicts, and legal claims."
        keywords="courtroom representation Pakistan, litigation services Lahore, court lawyer Karachi, legal advocacy Islamabad, trial lawyer Pakistan, court representation Rawalpindi, courtroom lawyer near me Pakistan"
        canonical="/Courtroom_Representation"
        ogImage="/6.%20Online%20Courtroom%20Representation%20in%20Lahore%20Pakistan.webp"
      />
      <ServiceLayout
        content={servicesData.courtroomRepresentation}
        faqKey="courtroomRepresentation"
        schemaConfig={schemaConfig}
      />
      <PakistanCoverage serviceName="Courtroom Representation Services" />
    </>
  );
}

export default CourtroomRepresentation;
