import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react'
import randomImage from '@/icons/Flower-icon.png'

function AndroidIcon({ text, containerWidth, padding, shape, bgColor, icon, bold, italic, textColor, preview, badgeText, badgeTextColor, badgeTextBgColor, paddingForImage, imageShape}) {

    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [fontSize, setFontSize] = useState(20); // initial size

    useEffect(() => {
        const resizeText = () => {
        if (!containerRef.current || !textRef.current) return;

        let size = 100;
        const containerWidth = containerRef.current.offsetWidth - padding * 1.2 - 25;

        const testSpan = document.createElement('span');
        testSpan.style.position = 'absolute';
        testSpan.style.visibility = 'hidden';
        testSpan.style.whiteSpace = 'nowrap';
        testSpan.innerText = text;
        document.body.appendChild(testSpan);

        while (size > 5) {
            testSpan.style.fontSize = `${size}px`;
            if (testSpan.offsetWidth <= containerWidth) break;
            size -= 1;
        }

        document.body.removeChild(testSpan);
        setFontSize(size);
        };

        resizeText();
    }, [text, containerWidth, padding]);


  return (
     <div className='h-44 w-44 shadow-2xl shadow-blue-500 border-[2px] border-sky-700 rounded-2xl'>
        <div className='flex justify-center  items-center  h-32 w-[172px]'>
            <div  ref={containerRef} className={`relative shadow-2xl shadow-black flex justify-center overflow-hidden items-center w-20 h-20 rounded-sm`}  style={{ backgroundColor: bgColor }} >
                <h1 ref={textRef} className={`${icon == "text" ? "flex" : "hidden"} ${bold ? "font-bold" : ""} ${italic ? "italic" : ""}`} style={{color: textColor,  fontSize: `${fontSize}px`, lineHeight: `${containerWidth}px`, whiteSpace: "nowrap",}}>
                    {text}
                </h1>
                <div style={{padding: paddingForImage}} className={`absolute w-20 h-20 justify-center items-center ${icon == "image" ? "flex" : "hidden"}`}>
                    <Image
                    src={preview || randomImage}
                    alt="Preview"
                    width={10}
                    height={10}
                    className={`w-full h-full ${imageShape == "circle" ? "rounded-full" : imageShape == "square" ? "rounded-none" : "rounded-[25%]"} object-cover `}
                    unoptimized
                    />
                </div>
                <div className={`absolute bottom-0 w-full overflow-hidden rounded-b-sm`} style={{ background : badgeTextBgColor,}}>
                    <p className={`text-center text-xs font-bold ${badgeText.length > 0 ? "h-4" : "h-0"}`} style={{color : badgeTextColor}}>{badgeText}</p>
                </div>
            </div>
        </div>
        <div className='text-center px-3'>
            <h1>Apple Icon</h1>
        </div>
    </div>
  )
}

export default AndroidIcon