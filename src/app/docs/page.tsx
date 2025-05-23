import React from "react";
import Head from "next/head";

const AndroidIconGuidelines = () => {
  return (
   <>
    <div className="p-8 max-w-4xl mx-auto text-gray-800">
      <Head>
        <title>Android Icon Guidelines</title>
      </Head>

      <h1 className="text-4xl font-bold mb-6">Android Icon Design Guidelines</h1>

      <p className="mb-4">
        This document outlines the comprehensive guidelines for designing Android app icons, including sizes,
        structure, styles, and export considerations. It is intended for developers and designers integrating Android
        icons into applications or websites.
      </p>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-2">🧠 Icon Types</h2>
        <ul className="list-disc ml-6">
          <li><strong>Adaptive Icons</strong> (Android 8.0+): Foreground and background layers, masked to shapes.</li>
          <li><strong>Legacy Launcher Icons</strong>: Single flat image for older versions.</li>
          <li><strong>Play Store Icon</strong>: Used in Play Store listings. Size: 512x512 px.</li>
          <li><strong>Notification Icons</strong>: White-only on transparent background, 24x24 px (mdpi).</li>
          <li><strong>Shortcut Icons</strong>: Prefer adaptive format for compatibility.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-2">🔄 Sizes & Densities</h2>
        <h3 className="font-bold">Adaptive & Legacy Launcher:</h3>
        <table className="w-full text-left border mt-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Density</th>
              <th className="border px-2 py-1">Size (px)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["mdpi", "48x48"],
              ["hdpi", "72x72"],
              ["xhdpi", "96x96"],
              ["xxhdpi", "144x144"],
              ["xxxhdpi", "192x192"],
            ].map(([density, size]) => (
              <tr key={density}>
                <td className="border px-2 py-1">{density}</td>
                <td className="border px-2 py-1">{size}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4"><strong>Adaptive Icon Layers:</strong> 108x108 dp (432x432 px @4x scale)</p>
        <p><strong>Safe Zone:</strong> 72x72 dp (66% of full icon)</p>
        <p><strong>Play Store:</strong> 512x512 px PNG (no transparency)</p>
        <p><strong>Notification Icons:</strong> 24x24 px (white-only, transparent bg)</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-2">🎨 Design Best Practices</h2>
        <ul className="list-disc ml-6">
          <li>Avoid embedding fixed shapes in the design.</li>
          <li>Keep content within the safe zone.</li>
          <li>Minimalistic, centered icons with bold colors.</li>
          <li>SVG preferred for vectors, PNG for bitmaps.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-2">🔨 Directory Structure</h2>
        <pre className="bg-gray-100 p-4 rounded">
{`res/
  mipmap-mdpi/        ic_launcher.png
  mipmap-hdpi/        ic_launcher.png
  mipmap-xhdpi/       ic_launcher.png
  mipmap-xxhdpi/      ic_launcher.png
  mipmap-xxxhdpi/     ic_launcher.png
  mipmap-anydpi-v26/
      ic_launcher.xml
      ic_launcher_round.xml`}
        </pre>

        <h3 className="font-bold mt-4">Sample XML for Adaptive Icon:</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm">
{`<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@drawable/ic_launcher_background" />
  <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`}
        </pre>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-2">⚠️ Common Mistakes to Avoid</h2>
        <ul className="list-disc ml-6">
          <li>Using transparency in Play Store icon.</li>
          <li>Placing content outside the safe zone.</li>
          <li>Embedding fixed shapes.</li>
          <li>Low contrast or very fine details.</li>
          <li>Using text as main graphic.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-2">📆 Tools & Resources</h2>
        <ul className="list-disc ml-6">
          <li><a href="https://romannurik.github.io/AndroidAssetStudio/" target="_blank" className="text-blue-600 underline">Android Asset Studio</a></li>
          <li><a href="https://material.io/resources/icons/" target="_blank" className="text-blue-600 underline">Material Design Icons</a></li>
          <li><a href="https://m3.material.io/" target="_blank" className="text-blue-600 underline">Google Material Design Guidelines</a></li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mt-8 mb-2">🎡 Web Integration & Dev Tools</h2>
        <p>Use canvas API to dynamically generate PNG icons with shapes, font sizing, and zip export:</p>
        <ul className="list-disc ml-6">
          <li>Use <code>ctx.measureText()</code> to auto-scale text.</li>
          <li>Apply shapes via <code>ctx.clip()</code>.</li>
          <li>Export images and zip using <code>jszip</code> in Node.js.</li>
        </ul>
      </section>




       {/* favicon */}
    </div>

      <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">🌐 Favicon Icon Design Guidelines</h1>

      <p className="mb-6">
        Favicons are small icons shown in browser tabs, bookmarks, and shortcuts. They are essential
        for site branding and identity.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-2">📐 Recommended Sizes</h2>
      <table className="w-full mb-6 border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Size</th>
            <th className="border px-4 py-2">Usage</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["16x16", "Standard favicon (oldest format)"],
            ["32x32", "Desktop browsers (HiDPI)"],
            ["48x48", "Windows desktop shortcut"],
            ["64x64", "HiDPI and PWA icons (optional)"],
            ["96x96", "Pinned tabs, app icons"],
            ["128x128", "Windows tile, Chrome OS"],
            ["180x180", "Apple Touch Icon"],
            ["192x192", "Android Chrome"],
            ["256x256", "Windows .ico, desktop icons"],
            ["512x512", "PWA (Progressive Web App) manifest"],
          ].map(([size, desc]) => (
            <tr key={size}>
              <td className="border px-4 py-2">{size}</td>
              <td className="border px-4 py-2">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-2xl font-semibold mt-8 mb-2">🧾 File Formats</h2>
      <ul className="list-disc pl-6 mb-6">
        <li><strong>.ico:</strong> Required for legacy browsers (includes 16x16, 32x32, 48x48)</li>
        <li><strong>.png:</strong> Preferred for high-res icons</li>
        <li><strong>.svg:</strong> Ideal for scalability (limited support)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">🧠 Design Best Practices</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Use simple, recognizable shapes</li>
        <li>Leave 10–20% transparent padding</li>
        <li>High contrast for clarity</li>
        <li>Keep file sizes small (under 100KB)</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">🔧 HTML Integration</h2>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto mb-6">
        {`<!-- Standard -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">

<!-- PNGs -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Apple -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">

<!-- Manifest -->
<link rel="manifest" href="/site.webmanifest">`}
      </pre>

      <h2 className="text-2xl font-semibold mt-8 mb-2">⚠️ Common Mistakes</h2>
      <ul className="list-disc pl-6 mb-6">
        <li>Only using a 16x16 favicon.ico</li>
        <li>Too much detail or text</li>
        <li>Missing support for mobile/PWA</li>
        <li>Not testing across devices</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-8 mb-2">🧩 Tools & Resources</h2>
      <ul className="list-disc pl-6 mb-10">
        <li><a href="https://realfavicongenerator.net/" className="text-blue-600 underline" target="_blank">RealFaviconGenerator</a></li>
        <li><a href="https://favicon.io/" className="text-blue-600 underline" target="_blank">Favicon.io</a></li>
        <li><a href="https://developers.google.com/web/tools/lighthouse" className="text-blue-600 underline" target="_blank">Google Lighthouse</a></li>
      </ul>
    </div>
   </>
  );
};

export default AndroidIconGuidelines;
