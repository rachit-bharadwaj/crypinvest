"use client";

import { useEffect, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Card } from "@/components/ui/card";

Chart.register(...registerables, ChartDataLabels);

export default function CurrencyComposition() {
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const data = {
    labels: ["USD", "GBP", "EUR", "Others"],
    datasets: [
      {
        data: [62, 8, 26, 4], // The values
        backgroundColor: ["#00E4FF", "#2A2D44", "#8A8FB9", "#1A1B2E"], // Colors
        borderColor: "#0A0B0D",
        hoverBackgroundColor: ["#00CFFF", "#1E2B3C", "#798DA9", "#161B26"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        color: "#FFFFFF",
        formatter: (value: any) => `${value}%`,
        font: {
          size: 14,
          weight: "bold" as const,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (tooltipItem: any) => {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw || 0;
            return `${label}: ${value}%`;
          },
        },
        backgroundColor: "#1A1B2E",
        borderColor: "#2A2D44",
        borderWidth: 1,
        titleColor: "#FFFFFF",
        bodyColor: "#8A8FB9",
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  useEffect(() => {
    if (!Chart) {
      console.error("Chart.js failed to initialize");
    }
  }, []);

  useEffect(() => {
    setWindowWidth(window.innerWidth); // Now it only runs in the client
    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (typeof window === "undefined" || windowWidth === null) return null;

  return (
    <Card
      className="py-6 bg-[#1A1B2E]/50 border-[#2A2D44] backdrop-blur-xl min-w-fit lg:w-full lg:mt-0"
      style={{
        animation: "shining-border 3s linear infinite",
      }}
    >
      <div className="text-white mb-4">
        <h3 className="text-lg font-bold px-6">Currency Composition</h3>
      </div>
      <div
        style={{
          position: "relative",
          height: windowWidth < 768 ? "250px" : "400px",
        }}
      >
        <Pie data={data} options={options} />
      </div>
    </Card>
  );
}
