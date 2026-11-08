import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const Charts = ({ before, after }: { before: number; after: number }) => {
  const data = {
    labels: ["ก่อนเรียน", "หลังเรียน"],
    datasets: [
      {
        label: "คะแนนรวม",
        data: [before, after],
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx } = chart;
          const gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
          gradient.addColorStop(0, "#1A56DB");
          gradient.addColorStop(1, "#1A56DB80");
          return gradient;
        },
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#333",
        },
      },
      tooltip: {
        backgroundColor: "#333",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: ${context.raw.toLocaleString()}`,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutBounce" as const,
    },
  };

  return (
    <div className="w-full flex justify-center h-full lg:max-h-96">
      <Bar data={data} options={options} />
    </div>
  );
};

export default Charts;
