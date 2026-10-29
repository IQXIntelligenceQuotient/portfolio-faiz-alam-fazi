import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const locations = [
  {
    province: "Punjab",
    total: 36,
    columns: [
      ["Lahore", "Kasur", "Sheikhupura", "Nankana Sahib"],
      ["Faisalabad", "Chiniot", "Toba Tek Singh"],
      ["Rawalpindi", "Attock", "Jhelum"],
      ["Multan", "Vehari", "Khanewal"],
      ["Gujranwala", "Sialkot", "Gujrat"],
    ],
  },
  {
    province: "Sindh",
    total: 30,
    columns: [
      ["Karachi", "Thatta", "Badin"],
      ["Hyderabad", "Tando Allahyar"],
      ["Sukkur", "Khairpur"],
      ["Larkana", "Shikarpur"],
      ["Nawabshah", "Dadu"],
    ],
  },
  {
    province: "KPK",
    total: 35,
    columns: [
      ["Peshawar", "Charsadda", "Nowshera"],
      ["Abbottabad", "Mansehra", "Haripur"],
      ["Mardan", "Swabi"],
      ["Swat", "Dir", "Buner"],
      ["Kohat", "Bannu", "D.I Khan"],
    ],
  },
  {
    province: "Balochistan",
    total: 34,
    columns: [
      ["Quetta", "Pishin"],
      ["Gwadar", "Turbat"],
      ["Khuzdar", "Awaran"],
      ["Chaman", "Zhob"],
      ["Sibi"],
    ],
  },
  {
    province: "Islamabad",
    total: 1,
    columns: [["Islamabad"]],
  },
  {
    province: "Azad Kashmir",
    total: 10,
    columns: [
      ["Muzaffarabad", "Hattian Bala"],
      ["Mirpur", "Kotli", "Bhimber"],
      ["Rawalakot", "Bagh", "Haveli"],
      ["Neelum Valley"],
    ],
  },
];

function ProvinceCard({ loc }) {
  return (
    <div className="relative w-[88vw] max-w-[560px] min-w-[300px] flex-none sm:w-[520px] lg:w-[560px]">
      <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-[#D4AF37]" />

      <div className="pl-6 sm:pl-8">
        <div className="mb-5 flex items-start justify-between gap-4 border-b pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={18} className="shrink-0 text-[#D4AF37]" />
            <h3 className="truncate text-lg font-bold text-[#1A2A4D] sm:text-xl">
              {loc.province}
            </h3>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-xs text-gray-500 sm:text-sm">Districts Covered</p>
            <p className="text-base font-bold text-[#1A2A4D] sm:text-lg">
              {loc.total}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:gap-x-10">
          {loc.columns.map((col, i) => (
            <div key={i} className="space-y-1">
              {col.map((city, idx) => (
                <div
                  key={city}
                  className="flex justify-between gap-3 text-sm text-gray-600 transition hover:text-[#1A2A4D]"
                >
                  <span className="truncate">{city}</span>
                  <span className="shrink-0 text-xs text-gray-400">#{idx + 1}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PakistanCoverage() {
  const firstSetRef = useRef(null);
  const [loopWidth, setLoopWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (firstSetRef.current) {
        setLoopWidth(firstSetRef.current.scrollWidth);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    if (firstSetRef.current) {
      resizeObserver.observe(firstSetRef.current);
    }

    window.addEventListener("resize", updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // pixels per second, this keeps speed constant on all screens
  const SPEED = 30;
  const duration = loopWidth ? loopWidth / SPEED : 30;

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <h1 className="select-none text-[72px] font-black tracking-widest text-[#1A2A4D]/5 sm:text-[120px] md:text-[180px]">
          PAKISTAN
        </h1>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-14 text-center sm:mb-16">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
            Nationwide Coverage
          </p>

          <h2 className="text-3xl font-black text-[#1A2A4D] md:text-4xl">
            Globeal legal Services
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm text-gray-500 sm:text-base">
            We operate across all provinces including Azad Kashmir, ensuring complete legal accessibility nationwide.
          </p>
        </div>

        <div className="overflow-hidden">
          <motion.div
            className="flex w-max gap-8 sm:gap-12 lg:gap-20"
            animate={loopWidth ? { x:  ["0%", "-50%"]}  : false}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration,
              ease: "linear",
            }}
          >
            {/* First set, measured */}
            <div ref={firstSetRef} className="flex gap-8 sm:gap-12 lg:gap-20">
              {locations.map((loc) => (
                <ProvinceCard key={`first-${loc.province}`} loc={loc} />
              ))}
            </div>

            {/* Duplicate set */}
            <div className="flex gap-8 sm:gap-12 lg:gap-20">
              {locations.map((loc) => (
                <ProvinceCard key={`second-${loc.province}`} loc={loc} />
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-16 text-center sm:mt-20">
          <a
            href="https://wa.me/923214277856"
            className="inline-block rounded-xl bg-[#1A2A4D] px-8 py-3 font-semibold text-white transition hover:bg-[#D4AF37] hover:text-[#1A2A4D]"
          >
            Contact Us Anywhere in Pakistan
          </a>
        </div>
      </div>
    </section>
  );
}