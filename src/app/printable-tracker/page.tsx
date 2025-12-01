// app/printable-tracker/page.tsx
"use client";

import { jsPDF } from "jspdf";
import { useEffect } from "react";

export default function PrintableTracker() {
  useEffect(() => {
    const generatePDF = () => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Background (your warm cream)
      doc.setFillColor(250, 242, 229); // #FAF2E5
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // Title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(93, 105, 57); // #5D6939
      doc.text("Lireon Weekly Reading Quest", pageWidth / 2, 30, {
        align: "center",
      });

      // Subtitle
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(170, 185, 126, 0.8); // #AAB97E at 80% opacity
      doc.text(
        "Level up your reading habit — Week of [Current Week]",
        pageWidth / 2,
        45,
        { align: "center" }
      );

      // Daily Goals Section
      doc.setFontSize(16);
      doc.setTextColor(93, 105, 57);
      doc.text("Daily Quests", 20, 70);

      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      let yPos = 85;
      days.forEach((day, index) => {
        // Day header
        doc.setFontSize(12);
        doc.setFillColor(219, 218, 174); // #DBDAAE
        doc.roundedRect(20, yPos, 170, 20, 3, 3, "F");
        doc.text(day, 25, yPos + 12, { align: "left" });

        // Goal input lines
        doc.setFontSize(10);
        doc.text("Goal: ___ pages | Read: ___ | Time: ___ min", 25, yPos + 15);
        doc.text("Mood: [ ] Sleepy [ ] Focused [ ] In the Zone", 25, yPos + 25);

        yPos += 35;
      });

      // Weekly Summary
      doc.setFontSize(16);
      doc.text("Boss Battle Summary", 20, yPos + 10);
      yPos += 20;
      doc.setFillColor(170, 185, 126);
      doc.roundedRect(20, yPos, 170, 40, 3, 3, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(
        "Total Pages: ___ | Books Finished: ___ | Streak: 🔥🔥🔥",
        25,
        yPos + 15
      );
      doc.text("Current Book Progress: (Draw circle & fill)", 25, yPos + 30);

      // Streak Tracker (flame icons)
      yPos += 50;
      doc.setFontSize(14);
      doc.setTextColor(93, 105, 57);
      doc.text("Streak Flames:", 20, yPos);
      // Simple flame shapes (you can enhance with paths)
      for (let i = 0; i < 7; i++) {
        doc.setFillColor(170, 185, 126);
        doc.circle(25 + i * 25, yPos + 10, 8, "F");
        doc.text("🔥", 22 + i * 25, yPos + 35, { align: "center" });
      }

      // Footer Quote
      doc.setFontSize(10);
      doc.setTextColor(93, 105, 57, 0.7);
      doc.text(
        "'The more that you read, the more things you will know.' — Dr. Seuss",
        20,
        pageHeight - 20
      );

      // Save & Download
      doc.save("Lireon_Weekly_Reading_Quest.pdf");
    };

    generatePDF();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAF2E5]">
      <div className="text-center p-8 rounded-2xl bg-white shadow-lg border border-[#DBDAAE]">
        <h1 className="text-2xl font-bold text-[#5D6939] mb-4">
          Generating Your Quest Sheet...
        </h1>
        <p className="text-[#5D6939]/70">
          Your personalized PDF is downloading now!
        </p>
      </div>
    </div>
  );
}
