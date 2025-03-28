'use client';

import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import {
  type AnyColorType,
  type cmyk,
  type hsl,
  type lab,
  type rgb,
  anyToCmyk,
  anyToHsl,
  anyToLab,
  anyToRgb,
  cmykToRgb,
  hslToRgb,
  labToRgb,
} from './convert';

// Define valid color types for each color mode
type ColorTypeMap = {
  rgb: 'r' | 'g' | 'b';
  cmyk: 'c' | 'm' | 'y' | 'k';
  hsl: 'h' | 's' | 'l';
  lab: 'l' | 'a' | 'b';
  oklab: 'o' | 'k' | 'l';
};

// Refine props to ensure colorType matches colorMode
interface ColorSliderProps {
  width: number;
  height: number;
  colorMode: 'rgb' | 'cmyk' | 'hsl' | 'lab' | 'oklab';
  colorType: ColorTypeMap[keyof ColorTypeMap];
  current: AnyColorType;
  onUpdate: (colorType: string, value: number) => void;
}

interface DrawParams {
  width: number;
  height: number;
  minValue: number;
  maxValue: number;
}

// Configuration for color modes
const colorModeConfig: Record<
  ColorSliderProps['colorMode'],
  {
    minMax: Record<string, { min: number; max: number }>;
    getValue: (color: AnyColorType, colorType: string) => number;
  }
> = {
  rgb: {
    minMax: { r: { min: 0, max: 255 }, g: { min: 0, max: 255 }, b: { min: 0, max: 255 } },
    getValue: (color: AnyColorType, colorType: string) => {
      const rgbColor = anyToRgb(color);
      return rgbColor[colorType as keyof rgb];
    },
  },
  cmyk: {
    minMax: { c: { min: 0, max: 100 }, m: { min: 0, max: 100 }, y: { min: 0, max: 100 }, k: { min: 0, max: 100 } },
    getValue: (color: AnyColorType, colorType: string) => {
      const cmykColor = anyToCmyk(color);
      return cmykColor[colorType as keyof cmyk];
    },
  },
  hsl: {
    minMax: { h: { min: 0, max: 360 }, s: { min: 0, max: 100 }, l: { min: 0, max: 100 } },
    getValue: (color: AnyColorType, colorType: string) => {
      const hslColor = anyToHsl(color);
      return Math.round(hslColor[colorType as keyof hsl]);
    },
  },
  lab: {
    minMax: { l: { min: 0, max: 100 }, a: { min: -128, max: 127 }, b: { min: -128, max: 127 } },
    getValue: (color: AnyColorType, colorType: string) => {
      const labColor = anyToLab(color);
      return Math.round(labColor[colorType as keyof lab]);
    },
  },
  oklab: {
    minMax: { o: { min: 0, max: 100 }, k: { min: -128, max: 127 }, l: { min: -128, max: 127 } },
    getValue: () => 0, // Placeholder for oklab (not implemented in your convert functions)
  },
};

const ColorSlider: React.FC<ColorSliderProps> = React.memo(
  ({ width, height, colorMode, colorType, current, onUpdate }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const drawParams = useRef<DrawParams>({ width, height, minValue: 0, maxValue: 255 });

    // Derive min/max values and slider value using useMemo
    const { minValue, maxValue } = useMemo(() => {
      const config = colorModeConfig[colorMode].minMax[colorType];
      drawParams.current.minValue = config.min;
      drawParams.current.maxValue = config.max;
      return { minValue: config.min, maxValue: config.max };
    }, [colorMode, colorType]);

    const sliderValue = useMemo(() => {
      return colorModeConfig[colorMode].getValue(current, colorType);
    }, [colorMode, colorType, current]);

    const sliderPosition = useMemo(() => {
      const xPos =
        ((sliderValue - minValue) / (maxValue - minValue)) * width - 8;
      return { top: 0, left: xPos };
    }, [sliderValue, minValue, maxValue, width]);

    // Draw the canvas gradient
    const draw = useCallback(() => {
      if (!contextRef.current) return;

      const params = drawParams.current;

      for (let x = 0; x < params.width; x++) {
        const scale = Math.round(
          ((x / params.width) * (params.maxValue - params.minValue)) +
            params.minValue
        );
        let rgb: rgb = { r: 0, g: 0, b: 0 };

        if (colorMode === 'cmyk') {
          const currentCmyk = anyToCmyk(current);
          rgb = cmykToRgb(
            colorType === 'c' ? scale : currentCmyk.c,
            colorType === 'm' ? scale : currentCmyk.m,
            colorType === 'y' ? scale : currentCmyk.y,
            colorType === 'k' ? scale : currentCmyk.k
          );
        } else if (colorMode === 'hsl') {
          const currentHsl = anyToHsl(current);
          rgb = hslToRgb(
            colorType === 'h' ? scale : currentHsl.h,
            colorType === 's' ? scale : currentHsl.s,
            colorType === 'l' ? scale : currentHsl.l
          );
        } else if (colorMode === 'lab') {
          const currentLab = anyToLab(current);
          rgb = labToRgb(
            colorType === 'l' ? scale : currentLab.l,
            colorType === 'a' ? scale : currentLab.a,
            colorType === 'b' ? scale : currentLab.b
          );
        } else if (colorMode === 'rgb') {
          const currentRgb = anyToRgb(current);
          rgb = {
            r: colorType === 'r' ? scale : currentRgb.r,
            g: colorType === 'g' ? scale : currentRgb.g,
            b: colorType === 'b' ? scale : currentRgb.b,
          };
        }

        contextRef.current.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        contextRef.current.fillRect(x, 0, 1, height);
      }
    }, [colorMode, colorType, current, height]);

    // Initialize canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas && !contextRef.current) {
        contextRef.current = canvas.getContext('2d');
      }
      if (contextRef.current) {
        requestAnimationFrame(draw);
      }
    }, [draw]);

    // Handle input change with validation
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const parsedValue = rawValue ? parseInt(rawValue, 10) : minValue;
        const newValue = Math.max(minValue, Math.min(maxValue, parsedValue));
        onUpdate(colorType, newValue);
      },
      [colorType, onUpdate, minValue, maxValue]
    );

    return (
      <div className="flex items-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="z-0"
            style={{ width, height }}
          />
          <div
            className="absolute rounded-full w-4 h-4 border border-black"
            style={sliderPosition}
          />
          <input
            type="range"
            value={sliderValue}
            step="1"
            min={minValue}
            max={maxValue}
            className="absolute w-full opacity-0 z-10"
            onChange={handleInputChange}
            style={{ top: 0, height: `${height}px` }}
          />
        </div>
        <input
          type="number"
          value={sliderValue}
          min={minValue}
          max={maxValue}
          onChange={handleInputChange}
          className="ml-3 w-10 h-8 px-1.5 text-black no-spin"
        />
      </div>
    );
  }
);

export default ColorSlider;