'use client'

import React, { useRef, useEffect, useState, ChangeEvent, MouseEvent } from 'react';

import {
  type AnyColorType, type cmyk, type lab, type rgb,
  anyConvert, anyToHsl, anyToHex,
  cmykToRgb,
  hexToCmyk, hexToLab, hexToRgb, hexToHsl,
  hslToRgb,
  rgbToHex,
  labToRgb
} from './convert';

import ColorSlider from './ColorSlider';

interface ColorPickerProps {
  width?: number;
  height?: number;
  onSelectColor?: (color: AnyColorType) => void;
}

type ColorMode = 'rgb' | 'cmyk' | 'lab' | 'oklab';

const colorMappings: { [key in ColorMode]: string[] } = {
  rgb: ['r', 'g', 'b'],
  cmyk: ['c', 'm', 'y', 'k'],
  lab: ['l', 'a', 'b'],
  oklab: ['o', 'k', 'l'],
};

const ColorPicker: React.FC<ColorPickerProps> = ({ width = 400, height = 400, onSelectColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDragging = useRef<boolean>(false);
  const [knobPosition, setKnobPosition] = useState({top: -8, left: -8});
  const [selectedColor, setSelectedColor] = useState<AnyColorType>({type: 'rgb', color: {r: 0, g: 0, b: 0}});
  const [colorMode, setColorMode] = useState<ColorMode>('rgb');

  const drawRGB = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    for (let x = 0; x < width; x++) {
      const hue = (x / width) * 360;
      for (let y = 0; y < height; y++) {
        const lightness = ((y / height) * 100);
        const rgbColor = hslToRgb(hue, 100, lightness);
        ctx.fillStyle = `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  };

  const updateKnobPosition = () => {
    const hsl = anyToHsl(selectedColor);
    const x = Math.round((hsl.h * width) / 360);
    const y = Math.round((height * hsl.l) / 100);
    setKnobPosition({top: y - 8, left: x - 8});
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !contextRef.current) {
      contextRef.current = canvas.getContext('2d', { willReadFrequently: true });
    }
    if (contextRef.current) {
      drawRGB(contextRef.current, width, height);
    }
  }, [width, height]);

  const handleDrag = (event: MouseEvent<HTMLCanvasElement>, bypass = false) => {
    if (!isDragging.current && !bypass) {
      return;
    }
    if (contextRef.current) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setKnobPosition({ top: y - 8, left: x - 8});

      const pixel = contextRef.current.getImageData(x, y, 1, 1).data;
      const color: AnyColorType = {
        type: 'rgb',
        color: {
          r: pixel[0],
          g: pixel[1],
          b: pixel[2]
        }
      };

      setSelectedColor(color);
      if (onSelectColor) {
        onSelectColor(color);
      }
    }
  };

  const handleColorModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const colorMode: ColorMode = event.target.value as ColorMode;

    setSelectedColor((prev) => {
      return anyConvert(prev, colorMode);
    });
    setColorMode(colorMode);
  };

  const handleSliderChange = (colorType: string, value: number) => {
    setSelectedColor((prev: AnyColorType) => {
      switch (prev.type) {
        case 'rgb':
          if (colorType in prev.color) {
            (prev.color as rgb)[colorType as keyof rgb] = value;
          }
          break;
        case 'cmyk':
          if (colorType in prev.color) {
            (prev.color as cmyk)[colorType as keyof cmyk] = value;
          }
          break;
        case 'lab':
          if (colorType in prev.color) {
            (prev.color as lab)[colorType as keyof lab] = value;
          }
          break;
      }
      return { ...prev };
    });
    updateKnobPosition();
  };

  return (
    <div>
      <div className='relative'>
        <canvas
          ref={canvasRef}
          style={{ width: width, height: height }}
          className='cursor-pointer z-0'
          width={width}
          height={height}
          onMouseDown={() => isDragging.current = true}
          onMouseUp={() => isDragging.current = false}
          onMouseMove={handleDrag}
          onClick={(e) => handleDrag(e, true)}
          onMouseOut={() => isDragging.current = false}
        />
        <div className='absolute rounded-full w-4 h-4 border border-black cursor-pointer pointer-events-none z-10' style={knobPosition}></div>
      </div>
      <div>
        <select className='text-black' onChange={handleColorModeChange}>
          <option value='rgb'>RGB</option>
          <option value='cmyk'>CMYK</option>
          <option value='lab'>LAB</option>
          <option value='oklab'>Oklab</option>
        </select>
      </div>
      {colorMappings[colorMode].map((mapping, index) => (
        <React.Fragment key={index}>
          <ColorSlider width={width - 52} height={16} colorMode={colorMode} colorType={mapping as any} current={selectedColor} onUpdate={handleSliderChange} /><br />
        </React.Fragment>
      ))}
      <div style={{ marginTop: '10px', width: '100px', height: '100px', backgroundColor: anyToHex(selectedColor).hex, border: '1px solid #000' }}></div>
    </div>
  );
}

export default ColorPicker;
