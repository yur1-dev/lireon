// src/app/api/generate-tracker-pdf/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Inter:wght@300;400;500;600;700&display=swap');
        
        @page {
            size: A4;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #2D3319;
            background: linear-gradient(135deg, #FDFBF7 0%, #F8F4E8 100%);
            position: relative;
        }
        
        /* Decorative background pattern */
        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                radial-gradient(circle at 20% 80%, rgba(170, 185, 126, 0.03) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(93, 105, 57, 0.03) 0%, transparent 50%);
            pointer-events: none;
        }
        
        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 0 auto;
            background: white;
            position: relative;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.1);
        }
        
        /* Elegant corner decorations */
        .corner-decoration {
            position: absolute;
            width: 60px;
            height: 60px;
            border: 2px solid #DBDAAE;
        }
        
        .corner-decoration.top-left {
            top: 10mm;
            left: 10mm;
            border-right: none;
            border-bottom: none;
            border-top-left-radius: 8px;
        }
        
        .corner-decoration.top-right {
            top: 10mm;
            right: 10mm;
            border-left: none;
            border-bottom: none;
            border-top-right-radius: 8px;
        }
        
        .corner-decoration.bottom-left {
            bottom: 10mm;
            left: 10mm;
            border-right: none;
            border-top: none;
            border-bottom-left-radius: 8px;
        }
        
        .corner-decoration.bottom-right {
            bottom: 10mm;
            right: 10mm;
            border-left: none;
            border-top: none;
            border-bottom-right-radius: 8px;
        }
        
        .container {
            padding: 25px 30px;
            position: relative;
            z-index: 1;
        }
        
        /* Header Section */
        .header {
            text-align: center;
            margin-bottom: 35px;
            position: relative;
        }
        
        .header::after {
            content: '';
            position: absolute;
            bottom: -15px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 3px;
            background: linear-gradient(90deg, transparent, #AAB97E, transparent);
        }
        
        .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 20px;
            position: relative;
        }
        
        .logo-glow {
            position: absolute;
            width: 280px;
            height: 100px;
            background: radial-gradient(ellipse, rgba(170, 185, 126, 0.15), transparent 70%);
            filter: blur(20px);
        }
        
        .logo {
            max-width: 240px;
            height: auto;
            position: relative;
            z-index: 2;
            filter: drop-shadow(0 4px 12px rgba(93, 105, 57, 0.15));
        }
        
        .title {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            font-weight: 700;
            color: #5D6939;
            text-transform: uppercase;
            letter-spacing: 4px;
            margin-bottom: 12px;
            position: relative;
            display: inline-block;
        }
        
        .title::before,
        .title::after {
            content: '✦';
            position: absolute;
            color: #AAB97E;
            font-size: 16px;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .title::before {
            left: -30px;
        }
        
        .title::after {
            right: -30px;
        }
        
        .subtitle {
            font-size: 13px;
            color: #7A8450;
            font-style: italic;
            font-weight: 400;
            letter-spacing: 0.5px;
        }
        
        /* Info Section */
        .info-section {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 35px;
            padding: 25px;
            background: linear-gradient(135deg, #FAF8F3 0%, #F5F2E8 100%);
            border-radius: 16px;
            border: 2px solid #DBDAAE;
            box-shadow: 0 4px 16px rgba(93, 105, 57, 0.08);
            position: relative;
            overflow: hidden;
        }
        
        .info-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #5D6939, #AAB97E, #5D6939);
        }
        
        .info-field {
            position: relative;
        }
        
        .info-field label {
            font-weight: 700;
            color: #5D6939;
            font-size: 11px;
            display: block;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }
        
        .info-field .line {
            border: none;
            border-bottom: 2px solid #5D6939;
            height: 28px;
            background: white;
            border-radius: 4px 4px 0 0;
            transition: all 0.3s ease;
        }
        
        /* Table Section */
        .table-container {
            margin-top: 30px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(93, 105, 57, 0.12);
        }
        
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background: white;
        }
        
        thead {
            background: linear-gradient(135deg, #5D6939 0%, #4a552d 100%);
            box-shadow: 0 2px 8px rgba(93, 105, 57, 0.2);
        }
        
        th {
            color: white;
            padding: 16px 12px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            font-weight: 700;
            border: none;
            position: relative;
        }
        
        th:not(:last-child)::after {
            content: '';
            position: absolute;
            right: 0;
            top: 25%;
            height: 50%;
            width: 1px;
            background: rgba(255, 255, 255, 0.2);
        }
        
        tbody tr {
            transition: all 0.2s ease;
        }
        
        tbody tr:hover {
            background: #FDFBF7;
        }
        
        td {
            padding: 18px 12px;
            border-bottom: 2px solid #F0EFE3;
            vertical-align: middle;
            font-size: 11px;
            position: relative;
        }
        
        tbody tr:last-child td {
            border-bottom: none;
        }
        
        .day-cell {
            font-weight: 700;
            color: #5D6939;
            background: linear-gradient(135deg, #FAF8F3 0%, #F5F2E8 100%);
            width: 110px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-right: 3px solid #DBDAAE;
        }
        
        .title-cell {
            width: 220px;
            font-weight: 500;
        }
        
        .date-cell {
            width: 95px;
            color: #7A8450;
        }
        
        .rating-cell {
            width: 120px;
            text-align: center;
        }
        
        .stars {
            font-size: 18px;
            color: #DBDAAE;
            letter-spacing: 3px;
            display: inline-block;
            text-shadow: 0 1px 2px rgba(93, 105, 57, 0.1);
        }
        
        /* Footer Section */
        .footer {
            margin-top: 40px;
            text-align: center;
            padding: 25px 20px 20px;
            border-top: 2px solid #DBDAAE;
            position: relative;
        }
        
        .footer::before {
            content: '';
            position: absolute;
            top: -1px;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 3px;
            background: linear-gradient(90deg, transparent, #5D6939, transparent);
        }
        
        .motivational {
            font-family: 'Playfair Display', serif;
            font-size: 16px;
            color: #5D6939;
            font-weight: 600;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }
        
        .footer-text {
            font-size: 11px;
            color: #7A8450;
            font-style: italic;
            font-weight: 400;
            letter-spacing: 0.5px;
        }
        
        .footer-text strong {
            color: #5D6939;
            font-weight: 600;
        }
        
        /* Print Optimizations */
        @media print {
            body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            
            .page {
                box-shadow: none;
                margin: 0;
            }
            
            @page {
                margin: 0;
            }
        }
        
        /* Responsive adjustments for screen preview */
        @media screen and (max-width: 800px) {
            .page {
                width: 100%;
                min-height: auto;
            }
            
            .info-section {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="page">
        <!-- Corner Decorations -->
        <div class="corner-decoration top-left"></div>
        <div class="corner-decoration top-right"></div>
        <div class="corner-decoration bottom-left"></div>
        <div class="corner-decoration bottom-right"></div>
        
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo-container">
                    <div class="logo-glow"></div>
                    <img src="${
                      process.env.NEXT_PUBLIC_BASE_URL ||
                      "http://localhost:3000"
                    }/lireon-centered-logo.png" alt="Lireon" class="logo" />
                </div>
                <div class="title">Daily Habit Tracker</div>
                <div class="subtitle">Track your reading journey, one day at a time</div>
            </div>
            
            <!-- Info Section -->
            <div class="info-section">
                <div class="info-field">
                    <label>Your Name</label>
                    <div class="line"></div>
                </div>
                <div class="info-field">
                    <label>Week Of</label>
                    <div class="line"></div>
                </div>
                <div class="info-field">
                    <label>Weekly Goal</label>
                    <div class="line"></div>
                </div>
            </div>
            
            <!-- Table -->
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Book Title</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="day-cell">Monday</td>
                            <td class="title-cell"></td>
                            <td class="date-cell"></td>
                            <td class="date-cell"></td>
                            <td class="rating-cell"><span class="stars">☆☆☆☆☆</span></td>
                        </tr>
                        <tr>
                            <td class="day-cell">Tuesday</td>
                            <td class="title-cell"></td>
                            <td class="date-cell"></td>
                            <td class="date-cell"></td>
                            <td class="rating-cell"><span class="stars">☆☆☆☆☆</span></td>
                        </tr>
                        <tr>
                            <td class="day-cell">Wednesday</td>
                            <td class="title-cell"></td>
                            <td class="date-cell"></td>
                            <td class="date-cell"></td>
                            <td class="rating-cell"><span class="stars">☆☆☆☆☆</span></td>
                        </tr>
                        <tr>
                            <td class="day-cell">Thursday</td>
                            <td class="title-cell"></td>
                            <td class="date-cell"></td>
                            <td class="date-cell"></td>
                            <td class="rating-cell"><span class="stars">☆☆☆☆☆</span></td>
                        </tr>
                        <tr>
                            <td class="day-cell">Friday</td>
                            <td class="title-cell"></td>
                            <td class="date-cell"></td>
                            <td class="date-cell"></td>
                            <td class="rating-cell"><span class="stars">☆☆☆☆☆</span></td>
                        </tr>
                        <tr>
                            <td class="day-cell">Saturday</td>
                            <td class="title-cell"></td>
                            <td class="date-cell"></td>
                            <td class="date-cell"></td>
                            <td class="rating-cell"><span class="stars">☆☆☆☆☆</span></td>
                        </tr>
                        <tr>
                            <td class="day-cell">Sunday</td>
                            <td class="title-cell"></td>
                            <td class="date-cell"></td>
                            <td class="date-cell"></td>
                            <td class="rating-cell"><span class="stars">☆☆☆☆☆</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="motivational">📚 "A reader lives a thousand lives before he dies." 📚</div>
                <div class="footer-text">Libre i-print kahit ilang beses! • <strong>lireon.app</strong></div>
            </div>
        </div>
    </div>
    
    <script>
        // Auto-print when page loads
        window.onload = function() {
            setTimeout(() => {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error generating tracker:", error);
    return NextResponse.json(
      { error: "Failed to generate tracker" },
      { status: 500 }
    );
  }
}
