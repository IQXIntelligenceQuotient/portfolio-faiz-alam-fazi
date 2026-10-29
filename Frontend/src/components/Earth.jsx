
// src/components/EarthCoverage.jsx
import { useEffect, useState, useRef } from "react";

const defaultServedCountries = [
  "PK", "AE", "SA", "QA", "OM", "KW", "BH", "BD", "LK", "MY",
  "SG", "AU", "NZ", "GB", "DE", "FR", "IT", "ES", "NL", "CA",
  "US", "ZA", "TR", "AF", "JP", "PH", "NG", "ID", "NO", "SE",
];

const EarthCoverage = ({
  targetCountries = 30,
  servedCountries = defaultServedCountries,
}) => {
  const [countryCount, setCountryCount] = useState(0);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const chartRef = useRef(null);

  // counter animation
  useEffect(() => {
    let count = 0;
    const duration = 1500;
    const step = 1;
    const intervalTime = Math.max(
      10,
      Math.floor(duration / (targetCountries || 1))
    );

    const interval = setInterval(() => {
      count += step;
      if (count >= targetCountries) {
        count = targetCountries;
        clearInterval(interval);
      }
      setCountryCount(count);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [targetCountries]);

  // Load amCharts scripts when component mounts
  useEffect(() => {
    // Call the loadAmCharts function from index.html
    if (typeof window.loadAmCharts === 'function') {
      window.loadAmCharts();
    }

    // Check if scripts are loaded, retry until they are
    const checkScripts = () => {
      if (window.am5 && window.am5map && window.am5geodata_worldLow && window.am5themes_Animated) {
        setChartsLoaded(true);
        return true;
      }
      return false;
    };

    // If already loaded, set state
    if (checkScripts()) return;

    // Poll for script loading
    const interval = setInterval(() => {
      if (checkScripts()) {
        clearInterval(interval);
      }
    }, 200);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // amCharts globe init (using CDN scripts loaded in index.html)
  useEffect(() => {
    if (!chartsLoaded || !chartRef.current) return;

    const win = window;
    const am5 = win.am5;
    const am5map = win.am5map;
    const am5geodata_worldLow = win.am5geodata_worldLow;
    const am5themes_Animated = win.am5themes_Animated;

    const root = am5.Root.new(chartRef.current);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "rotateY",
        projection: am5map.geoOrthographic(),
        rotationX: -90,
      })
    );

    chart.animate({
      key: "rotationX",
      to: 90,
      duration: 12000,
      loops: Infinity,
      easing: am5.ease.linear,
    });

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"],
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      stroke: am5.color(0x4e4e4e),
      fill: am5.color(0x202020),
    });

    polygonSeries.mapPolygons.template.adapters.add("fill", (fill, target) => {
      const id = target.dataItem?.dataContext?.id;
      if (id && servedCountries.includes(id)) {
        return am5.color(0x00ffd5);
      }
      return fill;
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0xffd700),
    });

    return () => {
      root.dispose();
    };
  }, [chartsLoaded, servedCountries]);

  return (
    <section
      style={{
        fontFamily: "Segoe UI, sans-serif",
        background: "linear-gradient(to right, #0f0f1a, #1a1a2e)",
        color: "#ffffff",
        paddingBottom: "40px",
      }}
    >
      <div className="text-center pt-5 text-lg font-bold my-9 py-20">
        <h2 style={{ marginTop: 0, fontWeight: 700, fontSize: "40px" }}>
          🌍 Trusted in <span>{countryCount}+</span> Countries &amp; Growing
        </h2>
      </div>

      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "600px",
          maxWidth: "1300px",
          margin: "30px auto",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: chartsLoaded ? "transparent" : "#1a1a2e",
        }}
      >
        {!chartsLoaded && (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Globe...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EarthCoverage;
