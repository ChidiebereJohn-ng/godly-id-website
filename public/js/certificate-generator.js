// public/js/certificate-generator.js
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib";

/**
 * Generates and downloads a certificate PDF in the browser.
 * @param {string} studentName 
 * @param {string} courseName 
 * @param {string} completionDate 
 */
export async function generateAndDownloadCertificate(studentName, courseName, completionDate) {
    try {
        // 1. Fetch the background image
        const response = await fetch('assets/certificate-bg.png');
        if (!response.ok) throw new Error("Failed to load certificate template.");
        const templateBytes = await response.arrayBuffer();

        // 2. Create PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([842, 595]); // A4 Landscape
        
        // 3. Embed Image
        const image = await pdfDoc.embedPng(templateBytes);
        const { width, height } = page.getSize();
        page.drawImage(image, { x: 0, y: 0, width, height });

        // 4. Embed Fonts
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // 5. Draw Text
        // Student Name
        const nameSize = 50;
        const nameText = studentName || "Student Name";
        const nameWidth = font.widthOfTextAtSize(nameText, nameSize);
        page.drawText(nameText, {
            x: (width - nameWidth) / 2,
            y: height / 2 + 20,
            size: nameSize,
            font: font,
            color: rgb(0.2, 0.2, 0.2),
        });

        // "For successfully completing..."
        const staticText = "For successfully completing the course";
        const staticSize = 18;
        const staticWidth = regularFont.widthOfTextAtSize(staticText, staticSize);
        page.drawText(staticText, {
            x: (width - staticWidth) / 2,
            y: height / 2 - 20,
            size: staticSize,
            font: regularFont,
            color: rgb(0.4, 0.4, 0.4)
        });

        // Course Name
        const courseSize = 30;
        const courseText = courseName || "Course Title";
        const courseWidth = font.widthOfTextAtSize(courseText, courseSize);
        page.drawText(courseText, {
            x: (width - courseWidth) / 2,
            y: height / 2 - 60,
            size: courseSize,
            font: font,
            color: rgb(0.98, 0.8, 0.08), // Gold
        });

        // Date
        const dateSize = 14;
        const dateText = `Date: ${completionDate}`;
        const dateWidth = regularFont.widthOfTextAtSize(dateText, dateSize);
        page.drawText(dateText, {
            x: (width - dateWidth) / 2,
            y: height / 2 - 100,
            size: dateSize,
            font: regularFont,
            color: rgb(0.3, 0.3, 0.3)
        });

        // 6. Save & Download
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        const safeName = courseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `certificate_${safeName}.pdf`;
        link.click();

    } catch (error) {
        console.error("Error generating certificate:", error);
        alert("Could not generate certificate. Please try again.");
    }
}

// Expose to window for easy calling
window.generateCertificate = generateAndDownloadCertificate;
