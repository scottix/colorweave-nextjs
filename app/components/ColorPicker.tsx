'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  type AnyColorType,
  anyConvert,
  anyToHsl,
  anyToHex,
  hslToRgb,
  rgbToAny,
} from './convert';
import ColorSlider from './ColorSlider';

interface ColorPickerProps {
  width?: number;
  height?: number;
  onSelectColor?: (color: AnyColorType) => void;
}

type ColorMode = 'rgb' | 'cmyk' | 'hsl' | 'lab' | 'oklab';

const colorMappings: { [key in ColorMode]: string[] } = {
  rgb: ['r', 'g', 'b'],
  cmyk: ['c', 'm', 'y', 'k'],
  hsl: ['h', 's', 'l'],
  lab: ['l', 'a', 'b'],
  oklab: ['o', 'k', 'l'],
};

const ColorPicker: React.FC<ColorPickerProps> = ({
  width = 400,
  height = 400,
  onSelectColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDragging = useRef<boolean>(false);
  const [knobPosition, setKnobPosition] = useState({ top: -8, left: -8 });
  const [selectedColor, setSelectedColor] = useState<AnyColorType>({
    type: 'rgb',
    color: { r: 0, g: 0, b: 0 },
  });
  const [colorMode, setColorMode] = useState<ColorMode>('rgb');

  const drawRGB = useCallback((ctx: CanvasRenderingContext2D) => {
    for (let x = 0; x < width; x++) {
      const hue = (x / width) * 360;
      for (let y = 0; y < height; y++) {
        const lightness = (y / height) * 100;
        const rgbColor = hslToRgb(hue, 100, lightness);
        ctx.fillStyle = `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [width, height]);

  const updateKnobPosition = useCallback(() => {
    const hsl = anyToHsl(selectedColor);
    const x = Math.round((hsl.h * width) / 360);
    const y = Math.round((height * hsl.l) / 100);
    setKnobPosition({ top: y - 8, left: x - 8 });
  }, [selectedColor, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !contextRef.current) {
      contextRef.current = canvas.getContext('2d', { willReadFrequently: true });
    }
    if (contextRef.current) {
      drawRGB(contextRef.current);
    }
  }, [drawRGB]);

  useEffect(() => {
    updateKnobPosition();
  }, [updateKnobPosition]);

  const handleDrag = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>, bypass = false) => {
      if (!isDragging.current && !bypass) return;
      if (contextRef.current && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const pixel = contextRef.current.getImageData(x, y, 1, 1).data;
        const color: AnyColorType = rgbToAny(pixel[0], pixel[1], pixel[2], colorMode);

        setSelectedColor(color);
        if (onSelectColor) {
          onSelectColor(color);
        }
      }
    },
    [colorMode, onSelectColor]
  );

  const handleColorModeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newColorMode: ColorMode = event.target.value as ColorMode;
      setSelectedColor((prev) => anyConvert(prev, newColorMode));
      setColorMode(newColorMode);
    },
    []
  );

  const handleSliderChange = useCallback((colorType: string, value: number) => {
    setSelectedColor((prev) => ({
      ...prev,
      color: { ...prev.color, [colorType]: value },
    }));
  }, []);

  return (
    <div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{ width, height }}
          className="cursor-pointer z-0"
          width={width}
          height={height}
          onMouseDown={() => (isDragging.current = true)}
          onMouseUp={() => (isDragging.current = false)}
          onMouseMove={handleDrag}
          onClick={(e) => handleDrag(e, true)}
          onMouseOut={() => (isDragging.current = false)}
        />
        <div
          className="absolute rounded-full w-4 h-4 border border-black cursor-pointer pointer-events-none z-10"
          style={knobPosition}
        />
      </div>
      <div>
        <select className="text-black" onChange={handleColorModeChange}>
          <option value="rgb">RGB</option>
          <option value="cmyk">CMYK</option>
          <option value="hsl">HSL</option>
          <option value="lab">LAB</option>
          <option value="oklab">Oklab</option>
        </select>
      </div>
      {colorMappings[colorMode].map((mapping, index) => (
        <React.Fragment key={index}>
          <ColorSlider
            width={width - 52}
            height={16}
            colorMode={colorMode}
            colorType={mapping as any}
            current={selectedColor}
            onUpdate={handleSliderChange}
          />
          <br />
        </React.Fragment>
      ))}
      <div
        style={{
          marginTop: '10px',
          width: '100px',
          height: '100px',
          backgroundColor: anyToHex(selectedColor).hex,
          border: '1px solid #000',
        }}
      />
    </div>
  );
};

export default ColorPicker;