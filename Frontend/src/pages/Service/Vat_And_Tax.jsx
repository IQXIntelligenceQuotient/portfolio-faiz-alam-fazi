import React from "react";
import ServiceLayout from "../../components/ServiceLayout.jsx";
import { servicesData } from "../../Data/servicesData.js";
import SEOHead from "../../components/seo/SEOHead.jsx";
import PakistanCoverage from "../../components/seo/PakistanCoverage.jsx";

const schemaConfig = {
  slug: "/vat_and_tax",
  name: "VAT and Tax Services in Pakistan",
  title: "Professional VAT and Tax Advisory Services for Businesses in Pakistan",
  description:
    "Professional VAT and tax advisory services for businesses across Pakistan. Expert tax planning, compliance, and filing services in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan.",
  serviceType: "Tax Advisory",
  image: "https://faizalamfaizi.com/10. Online VAT and Tax Services in Lahore Pakistan.webp",
  areaServed: [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Pakistan",
  ],
  keywords: [
    "tax consultant Pakistan", "VAT services Lahore", "tax advisory Karachi",
    "tax planning Islamabad", "tax compliance Pakistan", "tax filing Rawalpindi",
    "tax expert Faisalabad", "best tax consultant near me Pakistan",
  ],
  audience: "Businesses and individuals needing tax and VAT services in Pakistan",
};

function Vat_And_Tax() {
  return (
    <>
      <SEOHead
        title="VAT & Tax Services in Pakistan | Tax Consultant Lahore, Karachi, Islamabad, Rawalpindi"
        description="Professional VAT and tax advisory services for businesses across Pakistan. Expert tax planning, compliance, and filing services in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan."
        keywords="tax consultant Pakistan, VAT services Lahore, tax advisory Karachi, tax planning Islamabad, tax compliance Pakistan, tax filing Rawalpindi, tax expert Faisalabad, best tax consultant near me Pakistan"
        canonical="/vat_and_tax"
        ogImage="/10.%20Online%20VAT%20and%20Tax%20Services%20in%20Lahore%20Pakistan.webp"
      />
      <ServiceLayout
        content={servicesData.vatAndTaxServices}
        faqKey="vatAndTaxServices"
        schemaConfig={schemaConfig}
      />
      <PakistanCoverage serviceName="VAT & Tax Services" />
    </>
  );
}

export default Vat_And_Tax;
