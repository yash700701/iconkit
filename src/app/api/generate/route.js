export const runtime = 'nodejs'; // Must use Node runtime
export const dynamic = 'force-dynamic'; // Force dynamic rendering

import { NextResponse } from 'next/server';
import { createCanvas , loadImage} from 'canvas';
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

function drawBottomRoundedRect(ctx , x, y, width, height, radius) {
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
    const imageShape = formData.get('imageShape');
    const text = formData.get('text') || '';
    const textColor = formData.get('textColor') || '#000000';
    const bgColor = formData.get('bgColor') || '#ffffff';   
    const bold = formData.get('bold') === 'true';
    const italic = formData.get('italic') === 'true';
    // const bgType = formData.get('bgType');
    const paddingForText = formData.get('padding');
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

    let bufferForImage;
    if(file && file.size > 0){
      const arrayBuffer = await file?.arrayBuffer();
      bufferForImage = Buffer.from(arrayBuffer)
    }

    const zip = new JSZip();

    // const sizesForIos = [60, 120, 180]
    const sizesForAndroidLagacy = [48, 72, 96, 144, 192]
    const sizesForAndroidAdaptive = [108, 162, 216, 324, 432]
    const sizesForWeb = [16, 32, 48, 64, 180, 192, 512]
    // const sizesForLinux = [16, 22, 24, 32, 48, 64, 96, 128, 256, 512]`

    if (icon === "text") {
      if(downloadAndroid){
          for (const size of sizesForAndroidLagacy) {
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

            const padding = size * paddingForText / 100;

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

            if(badgeText.length > 0){
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
            }

            // ✅ Generate buffer from canvas and add to zip
            const iconBuffer = canvas.toBuffer('image/png');
            if(size == 48){
              zip.file(`android/mipmap-mdpi/ic_launcher.png`, iconBuffer);
            }else if(size == 72){
              zip.file(`android/mipmap-hdpi/ic_launcher.png`, iconBuffer);
            }else if(size == 96){
              zip.file(`android/mipmap-xhdpi/ic_launcher.png`, iconBuffer);
            }else if(size == 144){
              zip.file(`android/mipmap-xxhdpi/ic_launcher.png`, iconBuffer);
            }else{
              zip.file(`android/mipmap-xxxhdpi/ic_launcher.png`, iconBuffer);
            }
          }

          for (const size of sizesForAndroidAdaptive) {
            const canvasForBg = createCanvas(size, size);
            const ctxForBg = canvasForBg.getContext('2d'); 

            // === Background shape ===
            ctxForBg.fillStyle = bgColor;
            ctxForBg.fillRect(0, 0, size, size);
            const androidAdaptiveBackgroundBuffer = canvasForBg.toBuffer('image/png');
             if(size == 108){
              zip.file(`android/mipmap-mdpi/ic_launcher_background.png`, androidAdaptiveBackgroundBuffer);
            }else if(size == 162){
              zip.file(`android/mipmap-hdpi/ic_launcher_background.png`, androidAdaptiveBackgroundBuffer);
            }else if(size == 216){
              zip.file(`android/mipmap-xhdpi/ic_launcher_background.png`, androidAdaptiveBackgroundBuffer);
            }else if(size == 324){
              zip.file(`android/mipmap-xxhdpi/ic_launcher_background.png`, androidAdaptiveBackgroundBuffer);
            }else{
              zip.file(`android/mipmap-xxxhdpi/ic_launcher_background.png`, androidAdaptiveBackgroundBuffer);
            }
           
            // === Foreground ===
            const canvasForFg = createCanvas(size, size);
            const ctxForFg = canvasForFg.getContext('2d'); 
            const padding = size * 0.1;

            // === Auto-adjust font size for main text ===
            let fontSize = size;
            ctxForFg.textAlign = 'center';
            ctxForFg.textBaseline = 'middle';

            while (fontSize > 5) {
              ctxForFg.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px sans-serif`;
              const metrics = ctxForFg.measureText(text);
              const textWidth = metrics.width;
              const textHeight = (metrics.actualBoundingBoxAscent ?? fontSize * 0.8) + (metrics.actualBoundingBoxDescent ?? fontSize * 0.2);

              if (textWidth <= size - 2.5 * padding && textHeight <= size - 2.5 * padding) break;
              fontSize -= 1;
            }

            // === Draw main text ===
            ctxForFg.fillStyle = textColor;
            ctxForFg.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px sans-serif`;
            ctxForFg.fillText(text, size / 2, size / 2);

            if(badgeText.length > 0){
              // === Draw badge strip with rounded bottom matching shape ===
              const badgeHeight = size * 0.20;
              ctxForFg.save(); // Save current drawing state

              if (shape === 'circle') {
                ctxForFg.beginPath();
                ctxForFg.arc(size / 2, size / 2, size / 2, 0, Math.PI);
                ctxForFg.rect(0, size - badgeHeight, size, badgeHeight); // ensure bottom portion is covered
                ctxForFg.clip();
              } else if (shape === 'squircle') {
                ctxForFg.beginPath();
                drawBottomRoundedRect(ctxForFg, 0, size - badgeHeight, size, badgeHeight, size * 0.25);
                ctxForFg.clip();
              }
              // Square doesn't need clipping

              ctxForFg.fillStyle = badgeTextBgColor;
              ctxForFg.fillRect(0, size - badgeHeight, size, badgeHeight);

              ctxForFg.restore(); // Restore so text is not clipped

              // === Draw badge text ===
              ctxForFg.fillStyle = badgeTextColor;
              ctxForFg.font = `bold ${badgeHeight * 0.5}px sans-serif`;
              ctxForFg.textAlign = 'center';
              ctxForFg.textBaseline = 'middle';
              ctxForFg.fillText(badgeText, size / 2, size - badgeHeight / 2);
            }

            // ✅ Generate buffer from canvas and add to zip
             const androidAdaptiveForegroundBuffer = canvasForFg.toBuffer('image/png');
             if(size == 108){
              zip.file(`android/mipmap-mdpi/ic_launcher_Foreground.png`, androidAdaptiveForegroundBuffer);
            }else if(size == 162){
              zip.file(`android/mipmap-hdpi/ic_launcher_Foreground.png`, androidAdaptiveForegroundBuffer);
            }else if(size == 216){
              zip.file(`android/mipmap-xhdpi/ic_launcher_Foreground.png`, androidAdaptiveForegroundBuffer);
            }else if(size == 324){
              zip.file(`android/mipmap-xxhdpi/ic_launcher_Foreground.png`, androidAdaptiveForegroundBuffer);
            }else{
              zip.file(`android/mipmap-xxxhdpi/ic_launcher_Foreground.png`, androidAdaptiveForegroundBuffer);
            }
            
            // === monochrome ===

            const canvasForMonochrome = createCanvas(size, size);
            const ctxForMc = canvasForMonochrome.getContext('2d'); 
            const paddingMc = size * 0.1;

            // === Auto-adjust font size for main text ===
            let fontSizeMc = size;
            ctxForMc.textAlign = 'center';
            ctxForMc.textBaseline = 'middle';

            while (fontSizeMc > 5) {
              ctxForMc.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSizeMc}px sans-serif`;
              const metrics = ctxForMc.measureText(text);
              const textWidth = metrics.width;
              const textHeight = (metrics.actualBoundingBoxAscent ?? fontSizeMc * 0.8) + (metrics.actualBoundingBoxDescent ?? fontSizeMc * 0.2);

              if (textWidth <= size - 2.5 * paddingMc && textHeight <= size - 2.5 * paddingMc) break;
              fontSizeMc -= 1;
            }

            // === Draw main text ===
            ctxForMc.fillStyle = `#FFFFFF`;
            ctxForMc.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSizeMc}px sans-serif`;
            ctxForMc.fillText(text, size / 2, size / 2);

            if(badgeText.length > 0){
              // === Draw badge strip with rounded bottom matching shape ===
              const badgeHeight = size * 0.20;
              ctxForMc.save(); // Save current drawing state

              if (shape === 'circle') {
                ctxForMc.beginPath();
                ctxForMc.arc(size / 2, size / 2, size / 2, 0, Math.PI);
                ctxForMc.rect(0, size - badgeHeight, size, badgeHeight); // ensure bottom portion is covered
                ctxForMc.clip();
              } else if (shape === 'squircle') {
                ctxForMc.beginPath();
                drawBottomRoundedRect(ctxForMc, 0, size - badgeHeight, size, badgeHeight, size * 0.25);
                ctxForMc.clip();
              }
              // Square doesn't need clipping

              ctxForMc.fillStyle = `#FFFFFF`;
              ctxForMc.fillRect(0, size - badgeHeight, size, badgeHeight);

              ctxForMc.restore(); // Restore so text is not clipped

              // === Draw badge text ===
              ctxForMc.fillStyle = `#000000`;
              ctxForMc.font = `bold ${badgeHeight * 0.5}px sans-serif`;
              ctxForMc.textAlign = 'center';
              ctxForMc.textBaseline = 'middle';
              ctxForMc.fillText(badgeText, size / 2, size - badgeHeight / 2);
            }

            // ✅ Generate buffer from canvas and add to zip
             const androidAdaptiveMonochromeBuffer = canvasForMonochrome.toBuffer('image/png');
             if(size == 108){
              zip.file(`android/mipmap-mdpi/ic_launcher_monochrome.png`, androidAdaptiveMonochromeBuffer);
            }else if(size == 162){
              zip.file(`android/mipmap-hdpi/ic_launcher_monochrome.png`, androidAdaptiveMonochromeBuffer);
            }else if(size == 216){
              zip.file(`android/mipmap-xhdpi/ic_launcher_monochrome.png`, androidAdaptiveMonochromeBuffer);
            }else if(size == 324){
              zip.file(`android/mipmap-xxhdpi/ic_launcher_monochrome.png`, androidAdaptiveMonochromeBuffer);
            }else{
              zip.file(`android/mipmap-xxxhdpi/ic_launcher_monochrome.png`, androidAdaptiveMonochromeBuffer);
            }
           
          }

      }

      if(downloadApple){

      }

      if(downloadLinux){

      }

      if(downloadWeb){
          for (const size of sizesForWeb) {
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

            const padding = size * paddingForText / 100;

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

            if(badgeText.length > 0){
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
            }

            // ✅ Generate buffer from canvas and add to zip
            const iconBuffer = canvas.toBuffer('image/png');
            const faviconBuffer = await toIco([iconBuffer]);
            if(size == 16){
              zip.file(`favicon/icon-${size}x${size}/favicon.ico`, faviconBuffer);
            }else if(size == 32){
              zip.file(`favicon/icon-${size}x${size}/favicon.ico`, faviconBuffer);
            }else if(size == 48){
              zip.file(`favicon/icon-${size}x${size}/favicon.ico`, faviconBuffer);
            }else if(size == 64){
              zip.file(`favicon/icon-${size}x${size}/favicon.ico`, faviconBuffer);
            }else if(size == 180){
              zip.file(`favicon/icon-${size}x${size}/favicon.ico`, faviconBuffer);
            }else if(size == 192){
              zip.file(`favicon/icon-${size}x${size}/favicon.ico`, faviconBuffer);
            }else{
              zip.file(`favicon/icon-${size}x${size}/favicon.ico`, faviconBuffer);
            }
          }
      }

      if(downloadWindows){

      }
    }

    if (icon === "image") {

      if(downloadAndroid){

          for (const size of sizesForAndroidLagacy) {
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

            // === Draw the image inside the clipped shape ===
            const resizedImage = await sharp(bufferForImage).resize(size, size).png().toBuffer();
            const img = await loadImage(resizedImage);

            const padding = size * paddingForImage / 100;

            ctx.save(); // Save state

            if (imageShape === 'circle') {
              ctx.beginPath();
              ctx.arc(size / 2, size / 2, (size - 2 * padding) / 2, 0, 2 * Math.PI);
              ctx.clip();
            } else if (imageShape === 'squircle') {
              drawRoundedRect(ctx, padding, padding, size - 2 * padding, size - 2 * padding, (size - 2 * padding) * 0.25);
              ctx.clip();
            } else {
              ctx.beginPath();
              ctx.rect(padding, padding, size - 2 * padding, size - 2 * padding);
              ctx.clip();
            }

            // Then draw image with same padding
            ctx.drawImage(img, padding, padding, size - 2 * padding, size - 2 * padding);

            ctx.restore(); // Restore state


            // === Draw badge strip with rounded bottom matching shape ===
            if(badgeText.length > 0){
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
            }

            // === Export final image ===
            const outputBuffer = canvas.toBuffer('image/png');
            if(size == 48){
              zip.file(`android/mipmap-mdpi/ic_launcher.png`, outputBuffer);
            }else if(size == 72){
              zip.file(`android/mipmap-hdpi/ic_launcher.png`, outputBuffer);
            }else if(size == 96){
              zip.file(`android/mipmap-xhdpi/ic_launcher.png`, outputBuffer);
            }else if(size == 144){
              zip.file(`android/mipmap-xxhdpi/ic_launcher.png`, outputBuffer);
            }else{
              zip.file(`android/mipmap-xxxhdpi/ic_launcher.png`, outputBuffer);
            }

          }

          for (const size of sizesForAndroidAdaptive) {
            const canvasForBg = createCanvas(size, size);
            const ctxForBg = canvasForBg.getContext('2d'); 

            // === Background shape ===
            ctxForBg.fillStyle = bgColor;
            ctxForBg.fillRect(0, 0, size, size);
            const androidAdaptiveBackgroundBuffer = canvasForBg.toBuffer('image/png');
             if(size == 108){
              zip.file(`android/mipmap-mdpi/ic_launcher_background.png`, androidAdaptiveBackgroundBuffer);
            }else if(size == 162){
              zip.file(`android/mipmap-hdpi/ic_launcher_background.png`, androidAdaptiveBackgroundBuffer);
            }else if(size == 216){
              zip.file(`android/mipmap-xhdpi/ic_launcher_background.png`, androidAdaptiveBackgroundBuffer);
            }else if(size == 324){
              zip.file(`android/mipmap-xxhdpi/ic_launcher_background.png`, androidAdaptiveBackgroundBuffer);
            }else{
              zip.file(`android/mipmap-xxxhdpi/ic_launcher_background.png`, androidAdaptiveBackgroundBuffer);
            }


            // === Draw the image inside the clipped shape ===
            const canvasForFg = createCanvas(size, size);
            const ctxForFg = canvasForFg.getContext('2d'); 

            const resizedImage = await sharp(bufferForImage).resize(size, size).png().toBuffer();
            const img = await loadImage(resizedImage);

            const padding = size * paddingForImage / 100;

            ctxForFg.save(); // Save state

            if (imageShape === 'circle') {
              ctxForFg.beginPath();
              ctxForFg.arc(size / 2, size / 2, (size - 2 * padding) / 2, 0, 2 * Math.PI);
              ctxForFg.clip();
            } else if (imageShape === 'squircle') {
              drawRoundedRect(ctxForFg, padding, padding, size - 2 * padding, size - 2 * padding, (size - 2 * padding) * 0.25);
              ctxForFg.clip();
            } else {
              ctxForFg.beginPath();
              ctxForFg.rect(padding, padding, size - 2 * padding, size - 2 * padding);
              ctxForFg.clip();
            }

            // Then draw image with same padding
            ctxForFg.drawImage(img, padding, padding, size - 2 * padding, size - 2 * padding);

            ctxForFg.restore(); // Restore state


            // === Draw badge strip with rounded bottom matching shape ===
            if(badgeText.length > 0){
              const badgeHeight = size * 0.20;
              ctxForFg.save(); // Save current drawing state

              if (shape === 'circle') {
                ctxForFg.beginPath();
                ctxForFg.arc(size / 2, size / 2, size / 2, 0, Math.PI);
                ctxForFg.rect(0, size - badgeHeight, size, badgeHeight); // ensure bottom portion is covered
                ctxForFg.clip();
              } else if (shape === 'squircle') {
                ctxForFg.beginPath();
                drawBottomRoundedRect(ctxForFg, 0, size - badgeHeight, size, badgeHeight, size * 0.25);
                ctxForFg.clip();
              }
              // Square doesn't need clipping

              ctxForFg.fillStyle = badgeTextBgColor;
              ctxForFg.fillRect(0, size - badgeHeight, size, badgeHeight);

              ctxForFg.restore(); // Restore so text is not clipped

              // === Draw badge text ===
              ctxForFg.fillStyle = badgeTextColor;
              ctxForFg.font = `bold ${badgeHeight * 0.5}px sans-serif`;
              ctxForFg.textAlign = 'center';
              ctxForFg.textBaseline = 'middle';
              ctxForFg.fillText(badgeText, size / 2, size - badgeHeight / 2);
            }

            // === Export final image ===
            const outputBuffer = canvasForFg.toBuffer('image/png');
            if(size == 108){
              zip.file(`android/mipmap-mdpi/ic_launcher_foreground.png`, outputBuffer);
              zip.file(`android/mipmap-mdpi/ic_launcher_monochrome.png`, outputBuffer);
            }else if(size == 162){
              zip.file(`android/mipmap-hdpi/ic_launcher_foreground.png`, outputBuffer);
              zip.file(`android/mipmap-hdpi/ic_launcher_monochrome.png`, outputBuffer);
            }else if(size == 216){
              zip.file(`android/mipmap-xhdpi/ic_launcher_foreground.png`, outputBuffer);
              zip.file(`android/mipmap-xhdpi/ic_launcher_monochrome.png`, outputBuffer);
            }else if(size == 324){
              zip.file(`android/mipmap-xxhdpi/ic_launcher_foreground.png`, outputBuffer);
              zip.file(`android/mipmap-xxhdpi/ic_launcher_monochrome.png`, outputBuffer);
            }else{
              zip.file(`android/mipmap-xxxhdpi/ic_launcher_foreground.png`, outputBuffer);
              zip.file(`android/mipmap-xxxhdpi/ic_launcher_monochrome.png`, outputBuffer);
            }

          }
      }

      if(downloadApple){

      }

      if(downloadLinux){

      }

      if(downloadWeb){
        for (const size of sizesForWeb) {
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

          // === Draw the image inside the clipped shape ===
          const resizedImage = await sharp(bufferForImage).resize(size, size).png().toBuffer();
          const img = await loadImage(resizedImage);

          const padding = size * paddingForImage / 100;

          ctx.save(); // Save state

          if (imageShape === 'circle') {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, (size - 2 * padding) / 2, 0, 2 * Math.PI);
            ctx.clip();
          } else if (imageShape === 'squircle') {
            drawRoundedRect(ctx, padding, padding, size - 2 * padding, size - 2 * padding, (size - 2 * padding) * 0.25);
            ctx.clip();
          } else {
            ctx.beginPath();
            ctx.rect(padding, padding, size - 2 * padding, size - 2 * padding);
            ctx.clip();
          }

          // Then draw image with same padding
          ctx.drawImage(img, padding, padding, size - 2 * padding, size - 2 * padding);

          ctx.restore(); // Restore state


          // === Draw badge strip with rounded bottom matching shape ===
          if(badgeText.length > 0){
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
          }

          // === Export final image ===
          const outputBuffer = canvas.toBuffer('image/png');

          // Only once, if needed for Windows .ico
          const icoBuffer = await toIco([outputBuffer]);
          zip.folder('favicon');
          zip.file(`favicon/icon-${size}x${size}/favocon.ico`, icoBuffer);
          
        }  
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



