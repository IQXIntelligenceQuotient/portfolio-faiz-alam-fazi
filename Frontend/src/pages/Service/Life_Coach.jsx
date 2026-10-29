import React from "react";
import ServiceLayout from "../../components/ServiceLayout.jsx";
import { servicesData } from "../../Data/servicesData.js";
import SEOHead from "../../components/seo/SEOHead.jsx";
import PakistanCoverage from "../../components/seo/PakistanCoverage.jsx";

const schemaConfig = {
  slug: "/life-coach",
  name: "Life Coach Services in Pakistan",
  title: "Professional Life Coaching for Personal Growth and Goal Achievement in Pakistan",
  description:
    "Professional life coaching services for personal growth and goal achievement across Pakistan. Expert guidance in Lahore, Karachi, Islamabad, Rawalpindi for career development and life transformation.",
  serviceType: "Life Coaching",
  image: "https://faizalamfaizi.com/8. Online Life Coach in Lahore Pakistan.webp",
  areaServed: [
    "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
    "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot", "Pakistan",
  ],
  keywords: [
    "life coach Pakistan", "personal development Lahore", "life coaching Karachi",
    "career coach Islamabad", "goal achievement Pakistan", "motivational coach Rawalpindi",
    "best life coach near me Pakistan",
  ],
  audience: "Individuals seeking personal growth and professional development in Pakistan",
};

function Life_Coach() {
  return (
    <>
      <SEOHead
        title="Life Coach in Pakistan | Personal Development & Goal Achievement Lahore, Karachi"
        description="Professional life coaching services for personal growth and goal achievement across Pakistan. Expert guidance in Lahore, Karachi, Islamabad, Rawalpindi for career development, mindset, and life transformation."
        keywords="life coach Pakistan, personal development Lahore, life coaching Karachi, career coach Islamabad, goal achievement Pakistan, motivational coach Rawalpindi, best life coach near me Pakistan"
        canonical="/life-coach"
        ogImage="/8.%20Online%20Life%20Coach%20in%20Lahore%20Pakistan.webp"
      />
      <ServiceLayout
        content={servicesData.lifeCoach}
        faqKey="lifeCoach"
        schemaConfig={schemaConfig}
      />
      <PakistanCoverage serviceName="Life Coaching Services" />
    </>
  );
}

export default Life_Coach;
