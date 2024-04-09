'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';

import {
  type AnyColorType, type cmyk, type hsl, type lab, type rgb,
  anyToCmyk, anyToHsl, anyToLab, anyToRgb,
  cmykToRgb,
  hslToRgb,
  labToRgb
} from './convert';

interface ColorSliderProps {
  width: number;
  height: number;
  colorMode: 'rgb' | 'cmyk' | 'hsl' | 'lab' | 'oklab';
  colorType: 'r' | 'g' | 'b' | 'c' | 'm' | 'y' | 'k' | 'h' | 's' | 'l' | 'a';
  current: AnyColorType;
  onUpdate: (colorType: string, value: number) => void;
};

interface DrawParams {
  width: number;
  height: number;
  minValue: number;
  maxValue: number;
};

const ColorSlider: React.FC<ColorSliderProps> = ({width, height, colorMode, colorType, current, onUpdate}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawParams = useRef<DrawParams>({width: width, height: height, minValue: 0, maxValue: 255});
  const _sliderValue = useRef<number>(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderPosition, setSliderPosition] = useState({top: 0, left: -8});
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(255);

  const updateSliderValue = () => {
    if (colorMode === 'rgb') {
      const currentRgb: rgb = anyToRgb(current);
      switch(colorType) {
        case 'r':
          if (sliderValue !== currentRgb.r) {
            _sliderValue.current = currentRgb.r;
            setSliderValue(currentRgb.r);
          }
          break;
        case 'g':
          if (sliderValue !== currentRgb.g) {
            _sliderValue.current = currentRgb.g;
            setSliderValue(currentRgb.g);
          }
          break;
        case 'b':
          if (sliderValue !== currentRgb.b) {
            _sliderValue.current = currentRgb.b;
            setSliderValue(currentRgb.b);
          }
          break;
      }
    } else if (colorMode === 'cmyk') {
      const currentCmyk: cmyk = anyToCmyk(current);
      switch(colorType) {
        case 'c':
          if (sliderValue !== currentCmyk.c) {
            _sliderValue.current = currentCmyk.c;
            setSliderValue(currentCmyk.c);
          }
          break;
        case 'm':
          if (sliderValue !== currentCmyk.m) {
            _sliderValue.current = currentCmyk.m;
            setSliderValue(currentCmyk.m);
          }
          break;
        case 'y':
          if (sliderValue !== currentCmyk.y) {
            _sliderValue.current = currentCmyk.y;
            setSliderValue(currentCmyk.y);
          }
          break;
        case 'k':
          if (sliderValue !== currentCmyk.k) {
            _sliderValue.current = currentCmyk.k;
            setSliderValue(currentCmyk.k);
          }
          break;
      }
    } else if (colorMode === 'hsl') {
      const currentHsl: hsl = anyToHsl(current);
      switch(colorType) {
        case 'h':
          if (sliderValue !== currentHsl.h) {
            _sliderValue.current = Math.round(currentHsl.h);
            setSliderValue(Math.round(currentHsl.h));
          }
          break;
        case 's':
          if (sliderValue !== currentHsl.s) {
            _sliderValue.current = Math.round(currentHsl.s);
            setSliderValue(Math.round(currentHsl.s));
          }
          break;
        case 'l':
          if (sliderValue !== currentHsl.l) {
            _sliderValue.current = Math.round(currentHsl.l);
            setSliderValue(Math.round(currentHsl.l));
          }
          break;
      }
    } else if (colorMode === 'lab') {
      const currentLab: lab = anyToLab(current);
      switch(colorType) {
        case 'l': 
          if (sliderValue !== currentLab.l) {
            _sliderValue.current = Math.round(currentLab.l);
            setSliderValue(Math.round(currentLab.l));
          }
          break;
        case 'a':
          if (sliderValue !== currentLab.a) {
            _sliderValue.current = Math.round(currentLab.a);
            setSliderValue(Math.round(currentLab.a));
          }
          break;
        case 'b':
          if (sliderValue !== currentLab.b) {
            _sliderValue.current = Math.round(currentLab.b);
            setSliderValue(Math.round(currentLab.b));
          }
          break;
      }
    }
  };

  const updateColorMode = () => {
    switch(colorMode) {
      case 'cmyk':
        if (minValue !== 0 || maxValue !== 100) {
          setMinValue(0);
          setMaxValue(100);
          drawParams.current.minValue = 0;
          drawParams.current.maxValue = 100;
        }
        break;
      case 'hsl':
        if (colorType === 'h' && (minValue !== 0 || maxValue !== 360)) {
          setMinValue(0);
          setMaxValue(360);
          drawParams.current.minValue = 0;
          drawParams.current.maxValue = 360;
        } else if ((colorType === 's' || colorType === 'l') && (minValue !== 0 || maxValue !== 100)) {
          setMinValue(0);
          setMaxValue(100);
          drawParams.current.minValue = 0;
          drawParams.current.maxValue = 100;
        }
        break;
      case 'lab':
        if (colorType === 'l' && (minValue !== 0 || maxValue !== 100)) {
          setMinValue(0);
          setMaxValue(100);
          drawParams.current.minValue = 0;
          drawParams.current.maxValue = 100;
        } else if ((colorType === 'a' || colorType === 'b') && (minValue !== -128 || maxValue !== 128)) {
          setMinValue(-128);
          setMaxValue(127);
          drawParams.current.minValue = -128;
          drawParams.current.maxValue = 127;
        }
        break;
      case 'rgb':
        if (minValue !== 0 || maxValue !== 255) {
          setMinValue(0);
          setMaxValue(255);
          drawParams.current.minValue = 0;
          drawParams.current.maxValue = 255;
        }
        break;
    }
  };

  const updateSliderPosition = (newValue: number) => {
    const xPos = (((newValue - drawParams.current.minValue) / (drawParams.current.maxValue - drawParams.current.minValue)) * drawParams.current.width) - 8;
    setSliderPosition({top: 0, left: xPos});
  };

  const draw = () => {
    if (!contextRef.current) {
      return;
    }

    const params = drawParams.current;

    for (let x = 0; x < params.width; x++) {
      const scale = Math.round(((x / params.width) * (params.maxValue - params.minValue)) + params.minValue);
      if (colorMode === 'cmyk') {
        const currentCmyk = anyToCmyk(current);
        let rgb: rgb = {r:0, g:0, b:0};
        switch (colorType) {
          case 'c':
            rgb = cmykToRgb(scale, currentCmyk.m, currentCmyk.y, currentCmyk.k);
            break;
          case 'm':
            rgb = cmykToRgb(currentCmyk.c, scale, currentCmyk.y, currentCmyk.k);
            break;
          case 'y':
            rgb = cmykToRgb(currentCmyk.c, currentCmyk.m, scale, currentCmyk.k);
            break;
          case 'k':
            rgb = cmykToRgb(currentCmyk.c, currentCmyk.m, currentCmyk.y, scale);
            break;
        }
        contextRef.current.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      } else if (colorMode === 'hsl') {
        const currentHsl = anyToHsl(current);
        let rgb: rgb = {r:0, g:0, b:0};
        switch (colorType) {
          case 'h':
            rgb = hslToRgb(scale, currentHsl.s, currentHsl.l);
            break;
          case 's':
            rgb = hslToRgb(currentHsl.h, scale, currentHsl.l);
            break;
          case 'l':
            rgb = hslToRgb(currentHsl.h, currentHsl.s, scale);
            break;
        }
        contextRef.current.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      } else if (colorMode === 'lab') {
        const currentLab = anyToLab(current);
        let rgb: rgb = {r:0, g:0, b:0};
        switch (colorType) {
          case 'l':
            rgb = labToRgb(scale, currentLab.a, currentLab.b);
            break;
          case 'a':
            rgb = labToRgb(currentLab.l, scale, currentLab.b);
            break;
          case 'b':
            rgb = labToRgb(currentLab.l, currentLab.a, scale);
            break;
        }
        contextRef.current.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      } else if (colorMode === 'rgb') {
        const currentRgb = anyToRgb(current);
        switch (colorType) {
          case 'r':
            contextRef.current.fillStyle = `rgb(${scale}, ${currentRgb.g}, ${currentRgb.b})`;
            break;
          case 'g':
            contextRef.current.fillStyle = `rgb(${currentRgb.r}, ${scale}, ${currentRgb.b})`;
            break;
          case 'b':
            contextRef.current.fillStyle = `rgb(${currentRgb.r}, ${currentRgb.g}, ${scale})`;
            break;
        }
      }
      contextRef.current.fillRect(x, 0, 1, height);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && !contextRef.current) {
      contextRef.current = canvas.getContext('2d');
    }
    if (contextRef.current) {
      requestAnimationFrame(draw);
    }
  }, []);

  useEffect(() => {
    updateSliderPosition(_sliderValue.current);
  }, [sliderValue]);

  useEffect(() => {
    updateColorMode();
    updateSliderValue();
    if (contextRef.current) {
      requestAnimationFrame(draw);
    }
  }, [colorMode, colorType, current]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    onUpdate(colorType, newValue);
  };

  return (
    <div className='flex items-center'>
      <div className='relative'>
        <canvas ref={canvasRef} width={width} height={height} className='z-0' style={{ width: width, height: height }} />
        <div className='absolute rounded-full w-4 h-4 border border-black' style={sliderPosition}></div>
        <input type='range' value={sliderValue} step='1' min={minValue} max={maxValue} className='absolute w-full opacity-0 z-10' onChange={handleInputChange} style={{ top: 0, height: `${height}px` }} />
      </div>
      <input type='number' value={sliderValue} min={minValue} max={maxValue} onChange={handleInputChange} className='ml-3 w-10 h-8 px-1.5 text-black no-spin' />
    </div>
  );
};

export default ColorSlider;
