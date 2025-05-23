import { NextResponse } from 'next/server';
import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';
import JSZip from 'jszip';
import toIco from 'png-to-ico';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const icon = formData.get('icon');

    // text fields
    const shape = formData.get('shape');
    const text = formData.get('text');
    const bold = formData.get('bold');
    const italic = formData.get('italic');
    const textColor = formData.get('textColor');
    const bgColor = formData.get('bgColor');
    // const bgType = formData.get('bgType');
    // const padding = formData.get('padding');
    const badgeText = formData.get('badgeText');
    const badgeTextColor = formData.get('badgeTextColor');
    const badgeTextBgColor = formData.get('badgeTextBgColor');
    // const paddingForImage = formData.get('paddingForImage');
    
    const file = formData.get('image');

    // if (icon == image && !file) {
    //   return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    // }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const zip = new JSZip();

    const sizes = {
      ios: [60, 120, 180],
      android: [48, 72, 96, 144, 192],
      web: [16, 32, 48, 64, 96, 128, 180, 192, 256, 512],
      linux: [16, 22, 24, 32, 48, 64, 96, 128, 256, 512],
    };

   if (icon === "text") {
      for (const [platform, sizeList] of Object.entries(sizes)) {
        for (const size of sizeList) {
          const canvas = createCanvas(size, size);
          const ctx = canvas.getContext('2d');

          // === Background shape ===
          ctx.fillStyle = bgColor;
          if (shape === 'circle') {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
            ctx.fill();
          } else if (shape === 'square') {
            ctx.roundRect(0, 0, size, size, size * 0.05);
            ctx.fill();
          } else {
            ctx.roundRect(0, 0, size, size, size * 0.25); // squircle
            ctx.fill();
          }

          const padding = size * 0.1;

          // === Auto-adjust font size for main text ===
          let fontSize = size;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          while (fontSize > 5) {
            ctx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px sans-serif`;
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

            if (textWidth <= size - 2.5 * padding && textHeight <= size - 2.5 * padding) break;
            fontSize -= 1;
          }

          // === Draw main text ===
          ctx.fillStyle = textColor;
          ctx.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px sans-serif`;
          ctx.fillText(text, size / 2, size / 2);

          // === Draw badge strip with rounded bottom matching shape ===
          const badgeHeight = size * 0.20;
          ctx.save(); // Save current drawing state

          if (shape === 'circle') {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI); // bottom half arc
            ctx.rect(0, size - badgeHeight, size, badgeHeight); // ensure bottom portion is covered
            ctx.clip();
          } else if (shape === 'squircle') {
            ctx.beginPath();
            ctx.roundRect(0, size - badgeHeight, size, badgeHeight, size * 0.25);
            ctx.clip();
          }
          // Square doesn't need clipping

          ctx.fillStyle = badgeTextBgColor;
          ctx.fillRect(0, size - badgeHeight, size, badgeHeight);

          ctx.restore(); // Restore so text is not clipped

          // === Draw badge text ===
          ctx.fillStyle = badgeTextColor;
          ctx.font = `bold ${badgeHeight * 0.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, size / 2, size - badgeHeight / 2);

          // === Save PNG to ZIP ===
          const buffer = canvas.toBuffer('image/png');
          zip.file(`${platform}/icon-${size}x${size}.png`, buffer);
        }
      }
    }
 
   if (icon === "image") {
    for (const [platform, sizeList] of Object.entries(sizes)) {
      for (const size of sizeList) {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        // === Draw base shape (circle/squircle/square) ===
        ctx.fillStyle = bgColor;
        if (shape === 'circle') {
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
          ctx.clip(); // clip to circle
          ctx.fill();
        } else if (shape === 'squircle') {
          ctx.beginPath();
          ctx.roundRect(0, 0, size, size, size * 0.25);
          ctx.clip(); // clip to squircle
          ctx.fill();
        } else {
          // Square doesn't need clip
          ctx.fillRect(0, 0, size, size);
        }

        // === Draw the image inside the clipped shape ===
        const resizedImage = await sharp(buffer).resize(size, size).png().toBuffer();
        const img = await loadImage(resizedImage);
        ctx.drawImage(img, 0, 0, size, size);

        // === Badge strip ===
        if(badgeText.length > 0){
          const badgeHeight = size * 0.2;
          ctx.save(); // Save context before clipping badge

          if (shape === 'circle') {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI); // bottom half
            ctx.rect(0, size - badgeHeight, size, badgeHeight); // fallback rect
            ctx.clip();
          } else if (shape === 'squircle') {
            ctx.beginPath();
            ctx.roundRect(0, size - badgeHeight, size, badgeHeight, size * 0.25);
            ctx.clip();
          }
          // square doesn't need special clip

          ctx.fillStyle = badgeTextBgColor;
          ctx.fillRect(0, size - badgeHeight, size, badgeHeight);
          ctx.restore(); // unclip for text

          // === Badge Text ===
          ctx.fillStyle = badgeTextColor;
          ctx.font = `bold ${badgeHeight * 0.5}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(badgeText, size / 2, size - badgeHeight / 2);
        }

        // === Export final image ===
        const outputBuffer = canvas.toBuffer('image/png');
        zip.file(`${platform}/icon-${size}x${size}.png`, outputBuffer);

        // Only once, if needed for Windows .ico
        if (size === 256 && platform === "windows") {
          const icoBuffer = await toIco([outputBuffer]);
          zip.folder('windows');
          zip.file('windows/app-icon.ico', icoBuffer);
        }
      }
    }
  }



    // ✅ Generate Linux .desktop file
    // const desktopFileContent = `
    //   [Desktop Entry]
    //   Name=GeneratedApp
    //   Comment=Generated by Icon Platform
    //   Exec=generated-app
    //   Icon=icon-256x256
    //   Terminal=false
    //   Type=Application
    //   Categories=Utility;
    // `.trim();

    // zip.file('linux/GeneratedApp.desktop', desktopFileContent);

    // 📦 Return ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=icons.zip',
      },
    });
  } catch (err) {
    console.error('Error generating icons:', err);
    return NextResponse.json({ error: 'Failed to generate icons' }, { status: 500 });
  }
}



