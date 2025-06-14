"use client"


import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { ChromePicker } from 'react-color';

import download from '@/icons/downloading.png'

import { Input } from "@/components/ui/input"
import AndroidIcon from './androidIcon';
import AppleIcon from './appleIcon';
import FaviconIcon from './faviconIcon';
import WindowsIcon from './windowsIcon';
import logo from '@/icons/Flower-icon.png'

import remove from '../icons/remove.png'
import select from '../icons/checklist (1).png'
import Link from 'next/link';


export default function Home() {
  const [downloading, setDownloading] = useState(false);

  const [isAndroidVisible, setIsAndroidVisible] = useState(true);
  const [isAppleVisible, setIsAppleVisible] = useState(true);
  const [isMacVisible, setIsMacVisible] = useState(true);
  const [isWindowsVisible, setIsWindowsVisible] = useState(false);
  const [isWebVisible, setIsWebVisible] = useState(true);
  const [isLinuxVisible, setIsLinuxVisible] = useState(false);
  
  // tools
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [icon, setIcon] = useState("image");
  const [text, setText] = useState("IK");
  const [padding, setPadding] = useState(15);
  const [paddingForImage, setPaddingForImage] = useState(10);
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(true);
  const [textColor, setTextColor] = useState('#0288d1');
  const [showPickerForText, setShowPickerForText] = useState(false);
  const pickerRefText = useRef();
  const [bgColor, setBgColor] = useState('#000000');
  const [showPickerForBg, setShowPickerForBg] = useState(false);
  const pickerRefBg = useRef();
  const [bgType, setBgType] = useState("color");
  const [shape, setShape] = useState("squircle");
  const [imageShape, setImageShape] = useState("squircle");
  const [badgeText, setBadgeText] = useState("");
  const [badgeTextColor, setBadgeTextColor] = useState('#000000');
  const [showPickerForBadgeText, setShowPickerForBadgeText] = useState(false);
  const pickerRefBadgeText = useRef();
  const [badgeTextBgColor, setBadgeTextBgColor] = useState('#2dd4bf');
  const [showPickerForBadgeBg, setShowPickerForBadgeBg] = useState(false);
  const pickerRefBadgeBg = useRef();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRefText.current && !pickerRefText.current.contains(e.target)) {
        setShowPickerForText(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRefBg.current && !pickerRefBg.current.contains(e.target)) {
        setShowPickerForBg(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRefBadgeText.current && !pickerRefBadgeText.current.contains(e.target)) {
        setShowPickerForBadgeText(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRefBadgeBg.current && !pickerRefBadgeBg.current.contains(e.target)) {
        setShowPickerForBadgeBg(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    setDownloading(true)

    if (icon == "image" && !file){
      alert("select image");
      setDownloading(false);
      return;
    };

    const formData = new FormData();
    formData.append('image', file);
    formData.append('shape', shape);
    formData.append('imageShape', imageShape);
    formData.append('icon', icon);
    formData.append('text', text);
    formData.append('bold', bold);
    formData.append('italic', italic);
    formData.append('textColor', textColor);
    formData.append('bgColor', bgColor);
    formData.append('bgType', bgType);
    formData.append('padding', padding);
    formData.append('badgeText', badgeText);
    formData.append('badgeTextColor', badgeTextColor);
    formData.append('badgeTextBgColor', badgeTextBgColor);
    formData.append('paddingForImage', paddingForImage);

    formData.append('downloadAndroid', isAndroidVisible);
    formData.append('downloadApple', isAppleVisible);
    formData.append('downloadMac', isMacVisible);
    formData.append('downloadLinux', isLinuxVisible);
    formData.append('downloadWeb', isWebVisible);
    formData.append('downloadWindows', isWindowsVisible);

   try {
  const res = await axios.post('/api/generate', formData, {
    responseType: 'blob', // for downloading binary
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const blob = new Blob([res.data], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "icons.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false)
    }
  };

  return (

    <div className='w-full min-h-screen bg-zinc-100'>

       {/* header */}
       <div className='w-full flex flex-wrap justify-between text-zinc-800 px-5 items-center py-2 border-[1px] border-black'>
            
            {/* icon */}
            <div className='flex font-bold py-2'>
              <div className={`bg-black flex h-12 w-12 rounded-[25%] justify-center items-center`}>
                    <Image
                    src={logo}
                    alt="Preview"
                    width={10}
                    height={10}
                    className="w-8 h-8 object-cover"
                    unoptimized
                    />
              </div>
              <h1 className='text-4xl ml-2'>IconKit</h1>
            </div>

            {/* plateforms */}
            <div className='flex gap-2 sm:gap-5 overflow-x-scroll py-2'>
              <div className={`flex items-center border-[2px] px-4 py-1 rounded-full hover:shadow-lg hover:bg-zinc-20  ${isAndroidVisible ? "border-sky-700" : "border-zinc-400"}`}>
                <p className='pr-5'>Android</p> 
                <button className='cursor-pointer w-5 h-5' onClick={()=>{setIsAndroidVisible((prev)=>!prev)}}>
                  <Image src={isAndroidVisible ? remove : select} className='h-5 w-5' alt="x" />
                </button>
              </div>
              <div className={`flex items-center border-[2px] px-4 py-1 rounded-full hover:shadow-lg hover:bg-zinc-20  ${isAppleVisible ? "border-sky-700" : "border-zinc-400"}`}>
                <p className='pr-5'>IOS</p> 
                <button className='cursor-pointer w-5 h-5' onClick={()=>{setIsAppleVisible((prev)=>!prev)}}>
                  <Image src={isAppleVisible ? remove : select} className='h-5 w-5' alt="x" />
                </button>
              </div>
              <div className={`flex items-center border-[2px] px-4 py-1 rounded-full hover:shadow-lg hover:bg-zinc-20  ${isMacVisible ? "border-sky-700" : "border-zinc-400"}`}>
                <p className='pr-5'>MacOs</p> 
                <button className='cursor-pointer w-5 h-5' onClick={()=>{setIsMacVisible((prev)=>!prev)}}>
                  <Image src={isMacVisible ? remove : select} className='h-5 w-5' alt="x" />
                </button>
              </div>
              <div className={`flex items-center border-[2px] px-4 py-1 rounded-full hover:shadow-lg hover:bg-zinc-20  ${isWebVisible ? "border-sky-700" : "border-zinc-400"}`}>
                <p className='pr-5'>Favicon</p> 
                <button className='cursor-pointer w-5 h-5' onClick={()=>{setIsWebVisible((prev)=>!prev)}}>
                  <Image src={isWebVisible ? remove : select} className='h-5 w-5' alt="x" />
                </button>
              </div>
              <div className={`flex items-center border-[2px] px-4 py-1 rounded-full hover:shadow-lg hover:bg-zinc-20  ${isWindowsVisible ? "border-sky-700" : "border-zinc-400"}`}>
                <p className='pr-5'>Windows</p> 
                <button className='cursor-pointer w-5 h-5' onClick={()=>{setIsWindowsVisible((prev)=>!prev)}}>
                  <Image src={isWindowsVisible ? remove : select} className='h-5 w-5' alt="x" />
                </button>
              </div>
              <div className={`flex items-center border-[2px] px-4 py-1 rounded-full hover:shadow-lg hover:bg-zinc-20  ${isLinuxVisible ? "border-sky-700" : "border-zinc-400"}`}>
                <p className='pr-5'>Linux</p> 
                <button className='cursor-pointer w-5 h-5' onClick={()=>{setIsLinuxVisible((prev)=>!prev)}}>
                  <Image src={isLinuxVisible ? remove : select} className='h-5 w-5' alt="x" />
                </button>
              </div>
            </div>
 
            {/* download and docs */}
            <div className='flex gap-4 py-2 items-center'>
              <Link href={'/docs'}>
              <button className='flex items-center border-[2px] px-4 py-1 rounded-full hover:shadow-lg hover:bg-zinc-200 cursor-pointer'>
                ?
              </button>
              </Link>
              <button onClick={handleSubmit} className='flex items-center border-[2px] px-4 py-1 rounded-full hover:shadow-lg hover:bg-zinc-200 cursor-pointer'>
                <p className='pr-5'>{downloading ? 'Processing....' : 'Download Icons'}</p>
                <Image
                src={download}
                alt='download'
                className='w-5 h-5'
                />
              </button>
            </div>

       </div>

       {/* body */}
       <div className='grid sm:grid-cols-10'>

          {/* tools */}
          <div className='order-2 sm:border-r-[1px] border-black overflow-y-scroll max-h-[50vh] sm:max-h-[80vh] sm:order-1 text-lg sm:col-span-4  p-5 '>
            <div className='flex flex-wrap gap-3'>
              <p className='text-zinc-600'>Icon</p>
              <button onClick={()=>setIcon("text")} className={`border-[2px] ${icon == "text" ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Text</button>
              <button onClick={()=>setIcon("image")} className={`border-[2px] ${icon == "image" ? "border-sky-700" : "border-zinc-400"} cursor-pointer  hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Image</button>
              <button onClick={()=>setIcon("clipart")} className={`border-[2px] ${icon == "clipart" ? "border-sky-700" : "border-zinc-400"} cursor-pointer  hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Clipart</button>
            </div>

            <div className={`mt-2 ${icon == "text" ? "flex" : "hidden"}`} >
              <p className='text-zinc-600'>Text</p>
              <Input type="text" placeholder="Aa" value={text} onChange={(e)=> setText(e.target.value)} className='h-5 mt-1 ml-5 rounded-sm' />
            </div>

            <input
              type="file"
              name='image'
              accept="image/*"
              onChange={handleFileChange}
              className={`border-[1px] mt-2 p-1 w-full rounded-md text-lg text-zinc-600 ${icon == "image" ? "flex" : "hidden"}`}
            />

            <div className={`flex mt-2 flex-wrap gap-3   ${icon == "image" ? "flex" : "hidden"}`}>
              <p className={`text-zinc-600`}>Image shape</p>
              <button onClick={()=>setImageShape("square")} className={`border-[2px] ${imageShape == "square" ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Square</button>
              <button onClick={()=>setImageShape("squircle")} className={`border-[2px] ${imageShape == "squircle" ? "border-sky-700" : "border-zinc-400"} cursor-pointer  hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Squircle</button>
              <button onClick={()=>setImageShape("circle")} className={`border-[2px] ${imageShape == "circle" ? "border-sky-700" : "border-zinc-400"} cursor-pointer  hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Circle</button>
            </div>

            <div className={`mt-2 flex-wrap ${icon == "image" ? "flex" : "hidden"}`}>
              <div className=' flex mt-2 flex-wrap gap-3'>
                <p className='text-zinc-600'>Padding</p>
                <button onClick={()=>setPaddingForImage(0)} className={`border-[2px] ${paddingForImage == 0 ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}>0</button>
                <button onClick={()=>setPaddingForImage(5)} className={`border-[2px] ${paddingForImage == 5 ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}>5</button>
                <button onClick={()=>setPaddingForImage(10)} className={`border-[2px] ${paddingForImage == 10 ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}>10</button>
                <button onClick={()=>setPaddingForImage(15)} className={`border-[2px] ${paddingForImage == 15 ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}>15</button>
                <button onClick={()=>setPaddingForImage(20)} className={`border-[2px] ${paddingForImage == 20 ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}>20</button>
              </div>
            </div>

            <div className={`mt-2 flex-wrap ${icon == "text" ? "flex" : "hidden"}`}>
              <div className=' flex mt-2 flex-wrap gap-3'>
                <p className='text-zinc-600'>Padding</p>
                <button onClick={()=>setPadding(0)} className={`border-[2px] ${padding == 0 ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}>0</button>
                <button onClick={()=>setPadding(5)} className={`border-[2px] ${padding == 5 ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}>5</button>
                <button onClick={()=>setPadding(10)} className={`border-[2px] ${padding == 10 ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}>10</button>
                <button onClick={()=>setPadding(15)} className={`border-[2px] ${padding == 15 ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}>15</button>
                <button onClick={()=>setPadding(20)} className={`border-[2px] ${padding == 20 ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}>20</button>
              </div>
            </div>

            <div className={`mt-2 flex-wrap ${icon == "text" ? "flex" : "hidden"}`}>
              <div className=' flex mt-2'>
                <p className='text-zinc-600'>Bold/Italic</p>
                <button onClick={()=>setBold((prev)=>!prev)} className={`border-[2px] ${bold == true ? "border-sky-700" : "border-zinc-400"} cursor-pointer ml-2 hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}>B</button>
                <button onClick={()=>setItalic((prev)=>!prev)} className={`border-[2px] ${italic == true ? "border-sky-700" : "border-zinc-400"} cursor-pointer ml-2 hover:shadow-lg hover:bg-zinc-20 rounded-md px-2 text-sm`}><span className='italic'>I</span></button>
              </div>
            </div>

            <div className={`relative mt-2 items-center ${icon == "text" ? "flex" : "hidden"}`}>
              {/* Swatch */}
              <p className='text-zinc-600'>Color</p>
              <div
                className={`w-20 h-5  ml-5 rounded border cursor-pointer`}
                style={{ backgroundColor: textColor }}
                onClick={() => setShowPickerForText(!showPickerForText)}
              ></div>

              {/* Popover */}
              {showPickerForText && (
                <div
                  ref={pickerRefText}
                  className="absolute z-50 mt-2"
                >
                  <ChromePicker
                    color={textColor}
                    onChange={(updated) => setTextColor(updated.hex)}
                  />
                </div>
              )}
            </div>

            <h1 className='mt-2'>Background</h1>

            <div className=' flex mt-2 flex-wrap gap-3'>
              <p className='text-zinc-600'>Type</p>
              <button onClick={()=>setBgType("color")} className={`border-[2px] ${bgType == "color" ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Color</button>
              <button onClick={()=>setBgType("gradient")} className={`border-[2px] ${bgType == "gradient" ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Gradient</button>
              <button onClick={()=>setBgType("image")} className={`border-[2px] ${bgType == "image" ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Image</button>
            </div>

            <div className={`relative flex mt-2 items-center  ${bgType == "color" ? "flex" : "hidden"}`}>
              {/* Swatch */}
              <p className='text-zinc-600'>Color</p>
              <div
                className={`w-20 h-5  ml-5 rounded border cursor-pointer`}
                style={{ backgroundColor: bgColor }}
                onClick={() => setShowPickerForBg(!showPickerForBg)}
              ></div>

              {/* Popover */}
              {showPickerForBg && (
                <div
                  ref={pickerRefBg}
                  className="absolute z-50 mt-2"
                >
                  <ChromePicker
                    color={bgColor}
                    onChange={(updated) => setBgColor(updated.hex)}
                  />
                </div>
              )}
            </div>

            <h1 className='mt-2'>More</h1>

            <div className=' flex mt-2 flex-wrap gap-3'>
              <p className='text-zinc-600'>Shape</p>
              <button onClick={()=>setShape("square")} className={`border-[2px] ${shape == "square" ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Square</button>
              <button onClick={()=>setShape("squircle")} className={`border-[2px] ${shape == "squircle" ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Squircle</button>
              <button onClick={()=>setShape("circle")} className={`border-[2px] ${shape == "circle" ? "border-sky-700" : "border-zinc-400"} cursor-pointer hover:shadow-lg hover:bg-zinc-20 rounded-full px-4 text-sm`}>Circle</button>
            </div>

            <div className={`mt-2 flex`} >
              <p className='text-zinc-600'>Badge</p>
              <Input type="text" placeholder="Aa" value={badgeText} onChange={(e)=> setBadgeText(e.target.value)} className='h-5 w-full mt-1 ml-5 rounded-sm' />
            </div>
           
            <div className='flex flex-wrap mt-2 gap-3'>
                <div className="relative flex items-center">
                {/* Swatch */}
                <p className='text-zinc-600'>Badge text</p>
                <div
                  className="w-10 h-5  ml-5 rounded border cursor-pointer"
                  style={{ backgroundColor: badgeTextColor }}
                  onClick={() => setShowPickerForBadgeText(!showPickerForBadgeText)}
                ></div>

                {/* Popover */}
                {showPickerForBadgeText && (
                  <div
                    ref={pickerRefBadgeText}
                    className="absolute z-50 mt-2"
                  >
                    <ChromePicker
                      color={badgeTextColor}
                      onChange={(updated) => setBadgeTextColor(updated.hex)}
                    />
                  </div>
                )}
              </div>

              <div className="relative flex items-center">
                {/* Swatch */}
                <p className='text-zinc-600'>Badge bg</p>
                <div
                  className="w-10 h-5  ml-5 rounded border cursor-pointer"
                  style={{ backgroundColor: badgeTextBgColor }}
                  onClick={() => setShowPickerForBadgeBg(!showPickerForBadgeBg)}
                ></div>

                {/* Popover */}
                {showPickerForBadgeBg && (
                  <div
                    ref={pickerRefBadgeBg}
                    className="absolute z-50 mt-2"
                  >
                    <ChromePicker
                      color={badgeTextBgColor}
                      onChange={(updated) => setBadgeTextBgColor(updated.hex)}
                    />
                  </div>
                )}
              </div>
            </div>








             <h1 className='text-sm text-zinc-500 text-center py-5'>Made by <span className='text-sky-600'><a href="https://portfolio-yashtiwari.vercel.app/">@yash</a></span></h1>

          </div>

          {/* preview */}
          <div className='order-1 sm:order-2 flex sm:flex-wrap overflow-x-scroll gap-5 sm:gap-3 md:gap-7 lg:gap-10 sm:col-span-6 sm:p-2 md:p-8 lg:p-15 p-5'>

              {isAndroidVisible ? (
               <AndroidIcon text={text} padding={padding} containerWidth={60} shape={shape} bgColor={bgColor} icon={icon} bold={bold} italic={italic} textColor={textColor} preview={preview} badgeText={badgeText} badgeTextColor={badgeTextColor} badgeTextBgColor={badgeTextBgColor} paddingForImage={paddingForImage* 0.8} imageShape = {imageShape}/>
              ) : (<div></div>)}

              {isAppleVisible ? (
               <AppleIcon text={text} padding={padding} containerWidth={60} shape={shape} bgColor={bgColor} icon={icon} bold={bold} italic={italic} textColor={textColor} preview={preview} badgeText={badgeText} badgeTextColor={badgeTextColor} badgeTextBgColor={badgeTextBgColor} paddingForImage={paddingForImage* 0.8} imageShape = {imageShape}/>
              ) : (<div></div>)}

              {isMacVisible ? (
               <div className='h-44 w-44 shadow-2xl shadow-amber-500 border-[2px] border-sky-700 rounded-2xl'>
                  <div className='text-right px-3'></div>
                  <div className='h-36 w-44 '>
                  </div>
                  <div className='text-center '>MacOs Icon</div>
                </div>
              ) : (<div></div>)}

              {isWebVisible ? (
                 <FaviconIcon text={text} padding={padding} containerWidth={60} shape={shape} bgColor={bgColor} icon={icon} bold={bold} italic={italic} textColor={textColor} preview={preview} badgeText={badgeText} badgeTextColor={badgeTextColor} badgeTextBgColor={badgeTextBgColor} paddingForImage={paddingForImage* 0.8} imageShape = {imageShape}/>
              ) : (<div></div>)}
              
              {isWindowsVisible ? (
                <WindowsIcon text={text} padding={padding} containerWidth={60} shape={shape} bgColor={bgColor} icon={icon} bold={bold} italic={italic} textColor={textColor} preview={preview} badgeText={badgeText} badgeTextColor={badgeTextColor} badgeTextBgColor={badgeTextBgColor} paddingForImage={paddingForImage* 0.8} imageShape = {imageShape}/>
              ) : (<div></div>)}

              {isLinuxVisible ? (
                <div className='h-44 w-44 shadow-2xl shadow-amber-500 border-[2px] border-sky-700 rounded-2xl'>
                  <div className='text-right px-3'></div>
                  <div className='h-36 w-44 '>
                  </div>
                  <div className='text-center '>Linux Icon</div>
                </div>
              ) : (<div></div>)}

          </div>
       </div> 
    </div>
  );
}





