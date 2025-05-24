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

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawBottomRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y); // top edge
  ctx.lineTo(x + width, y + height - radius); // right side
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height); // bottom-right
  ctx.lineTo(x + radius, y + height); // bottom edge
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius); // bottom-left
  ctx.lineTo(x, y); // left side
  ctx.closePath();
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    // icon type
    const icon = formData.get('icon');

    // fields
    const file = formData.get('image');
    const shape = formData.get('shape');
    const text = formData.get('text') || '';
    const textColor = formData.get('textColor') || '#000000';
    const bgColor = formData.get('bgColor') || '#ffffff';   
    const bold = formData.get('bold') === 'true';
    const italic = formData.get('italic') === 'true';
    const bgType = formData.get('bgType');
    const padding = formData.get('padding');
    const badgeText = formData.get('badgeText');
    const badgeTextColor = formData.get('badgeTextColor');
    const badgeTextBgColor = formData.get('badgeTextBgColor');
    const paddingForImage = formData.get('paddingForImage');

    // download fields
    const downloadAndroid = formData.get('downloadAndroid') == 'true';
    const downloadApple = formData.get('downloadApple') == 'true';
    const downloadLinux = formData.get('downloadLinux') == 'true';
    const downloadWeb = formData.get('downloadWeb') == 'true';
    const downloadWindows = formData.get('downloadWindows') == 'true';

    // const arrayBuffer = await file.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);
    const zip = new JSZip();

    const sizesForIos = [60, 120, 180]

    const sizesForAndroid = [48, 72, 96, 144, 192]

    const sizesForWeb = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512]

    const sizesForLinux = [16, 22, 24, 32, 48, 64, 96, 128, 256, 512]

    if (icon === "text") {

      if(downloadAndroid){
          for (const size of sizesForAndroid) {
            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d'); 

            // === Background shape ===
            ctx.fillStyle = bgColor;
            if (shape === 'circle') {
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
              ctx.fill();
            } else if (shape === 'square') {
              drawRoundedRect(ctx, 0, 0, size, size, size * 0); // For square
              ctx.fill();
            } else {
              drawRoundedRect(ctx, 0, 0, size, size, size * 0.25); // For squircle
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
              const textHeight = (metrics.actualBoundingBoxAscent ?? fontSize * 0.8) + (metrics.actualBoundingBoxDescent ?? fontSize * 0.2);

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
              ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI);
              ctx.rect(0, size - badgeHeight, size, badgeHeight); // ensure bottom portion is covered
              ctx.clip();
            } else if (shape === 'squircle') {
              ctx.beginPath();
              drawBottomRoundedRect(ctx, 0, size - badgeHeight, size, badgeHeight, size * 0.25);
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

            // ✅ Generate buffer from canvas and add to zip
            const iconBuffer = canvas.toBuffer('image/png');
            zip.file(`Android/icon-${size}x${size}.png`, iconBuffer);
          }
      }

      if(downloadApple){

      }

      if(downloadLinux){

      }

      if(downloadWeb){

      }

      if(downloadWindows){

      }
    }


    // 📦 Return ZIP
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename=icons.zip',
      },
    });
  } catch (err) {
    console.error('Error generating icons:', err.stack || err);
    return NextResponse.json({ error: 'Failed to generate icons' }, { status: 500 });
  }
}



