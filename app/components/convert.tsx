
export interface cmyk {
  c: number;
  m: number;
  y: number;
  k: number;
}

export interface hex {
  hex: string;
}

export interface hsl {
  h: number;
  s: number;
  l: number;
}

export interface lab {
  l: number;
  a: number;
  b: number;
}

export interface rgb {
  r: number;
  g: number;
  b: number;
}

export interface xyz {
  x: number;
  y: number;
  z: number;
}

type mode = 'cmyk' | 'hex' | 'hsl' | 'lab' | 'oklab' | 'rgb';

export type AnyColorType =
  | { type: 'hex'; color: hex; }
  | { type: 'rgb'; color: rgb; }
  | { type: 'cmyk'; color: cmyk; }
  | { type: 'hsl'; color: hsl; }
  | { type: 'lab'; color: lab; }
  | { type: 'xyz'; color: xyz; };

const anyConvert = (anyColor: AnyColorType, mode: mode): AnyColorType => {
  switch (mode) {
    case 'cmyk':
      return {type: 'cmyk', color: anyToCmyk(anyColor)};
    case 'hex':
      return {type: 'hex', color: anyToHex(anyColor)};
    case 'hsl':
      return {type: 'hsl', color: anyToHsl(anyColor)};
    case 'lab':
      return {type: 'lab', color: anyToLab(anyColor)};
    case 'rgb':
      return {type: 'rgb', color: anyToRgb(anyColor)};
  }

  return {type: 'hex', color: {hex: '#000'}};
};

const anyToCmyk = (anyColor: AnyColorType): cmyk => {
  switch (anyColor.type) {
    case 'cmyk':
      return anyColor.color;
    case 'hex':
      return hexToCmyk(anyColor.color.hex);
    case 'hsl':
      return hslToCmyk(anyColor.color.h, anyColor.color.s, anyColor.color.l);
    case 'lab':
      return labToCmyk(anyColor.color.l, anyColor.color.a, anyColor.color.b);
    case 'rgb':
      return rgbToCmyk(anyColor.color.r, anyColor.color.g, anyColor.color.b);
  }
  return {c: 0, m: 0, y: 0, k: 0};
}

const anyToHex = (anyColor: AnyColorType): hex => {
  switch (anyColor.type) {
    case 'cmyk':
      return {hex: cmykToHex(anyColor.color.c, anyColor.color.m, anyColor.color.y, anyColor.color.k)};
    case 'hex':
      return anyColor.color;
    case 'hsl':
      return {hex: hslToHex(anyColor.color.h, anyColor.color.s, anyColor.color.l)};
    case 'lab':
      return {hex: labToHex(anyColor.color.l, anyColor.color.a, anyColor.color.b)};
    case 'rgb':
      return {hex: rgbToHex(anyColor.color.r, anyColor.color.g, anyColor.color.b)};
  }
  return {hex: '#000'};
}

const anyToHsl = (anyColor: AnyColorType): hsl => {
  switch (anyColor.type) {
    case 'cmyk':
      return cmykToHsl(anyColor.color.c, anyColor.color.m, anyColor.color.y, anyColor.color.k);
    case 'hex':
      return hexToHsl(anyColor.color.hex);
    case 'hsl':
      return anyColor.color;
    case 'lab':
      return labToHsl(anyColor.color.l, anyColor.color.a, anyColor.color.b);
    case 'rgb':
      return rgbToHsl(anyColor.color.r, anyColor.color.g, anyColor.color.b);
  }
  return {h: 0, s: 0, l: 0};
};

const anyToLab = (anyColor: AnyColorType): lab => {
  switch (anyColor.type) {
    case 'cmyk':
      return cmykToLab(anyColor.color.c, anyColor.color.m, anyColor.color.y, anyColor.color.k);
    case 'hex':
      return hexToLab(anyColor.color.hex);
    case 'hsl':
      return hslToLab(anyColor.color.h, anyColor.color.s, anyColor.color.l);
    case 'lab':
      return anyColor.color;
    case 'rgb':
      return rgbToLab(anyColor.color.r, anyColor.color.g, anyColor.color.b);
  }
  return {l: 0, a: -128, b: -128};
};

const anyToRgb = (anyColor: AnyColorType): rgb => {
  switch (anyColor.type) {
    case 'cmyk':
      return cmykToRgb(anyColor.color.c, anyColor.color.m, anyColor.color.y, anyColor.color.k);
    case 'hex':
      return hexToRgb(anyColor.color.hex);
    case 'hsl':
      return hslToRgb(anyColor.color.h, anyColor.color.s, anyColor.color.l)
    case 'lab':
      return labToRgb(anyColor.color.l, anyColor.color.a, anyColor.color.b);
    case 'rgb':
      return anyColor.color;
  }
  return {r: 0, g: 0, b: 0};
};

const cmykToHex = (c: number, m: number, y: number, k: number): string => {
  const rgb: rgb = cmykToRgb(c, m, y, k);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

const cmykToHsl = (c: number, m: number, y: number, k: number): hsl => {
  const rgb: rgb = cmykToRgb(c, m, y, k);
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
};

const cmykToLab = (c: number, m: number, y: number, k: number): lab => {
  const rgb: rgb = cmykToRgb(c, m, y, k);
  return rgbToLab(rgb.r, rgb.g, rgb.b);
};

const cmykToRgb = (c: number, m: number, y: number, k: number): rgb => {
  const r = 255 * (1 - c / 100) * (1 - k / 100);
  const g = 255 * (1 - m / 100) * (1 - k / 100);
  const b = 255 * (1 - y / 100) * (1 - k / 100);

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b)
  };
};

const hexToCmyk = (hex: string): cmyk => {
  const rgb: rgb = hexToRgb(hex);
  return rgbToCmyk(rgb.r, rgb.g, rgb.b);
}

const hexToRgb = (hex: string): rgb => {
  if (hex[0] === '#') {
    hex = hex.substring(1);
  }

  let rHex: string, gHex: string, bHex: string;
  if (hex.length === 3) {
    rHex = hex[0] + hex[0];
    gHex = hex[1] + hex[1];
    bHex = hex[2] + hex[2];
  } else if (hex.length === 6) {
    rHex = hex.substring(0, 2);
    gHex = hex.substring(2, 4);
    bHex = hex.substring(4, 6);
  } else {
    console.error('Warning: Invalid hex input ' + hex);
    return {r:0,g:0,b:0};
  }

  return {
    r: parseInt(rHex, 16),
    g: parseInt(gHex, 16),
    b: parseInt(bHex, 16),
  };
}

const hexToHsl = (hex: string): hsl => {
  const rgb: rgb = hexToRgb(hex);
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

const hexToLab = (hex: string): lab => {
  const rgb: rgb = hexToRgb(hex);
  return rgbToLab(rgb.r, rgb.g, rgb.b);
};

const hslToCmyk = (h: number, s: number, l: number): cmyk => {
  const rgb: rgb = hslToRgb(h, s, l);
  return rgbToCmyk(rgb.r, rgb.g, rgb.b);
};

const hslToLab = (h: number, s: number, l: number): lab => {
  const rgb: rgb = hslToRgb(h, s, l);
  return rgbToLab(rgb.r, rgb.g, rgb.b);
};

const hslToHex = (h: number, s: number, l: number): string => {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

// https://www.baeldung.com/cs/convert-color-hsl-rgb
const hslToRgb = (h: number, s: number, l: number): rgb => {
  const sprime = s / 100;
  const lprime = l / 100;
  const chroma = (1 - Math.abs(2 * lprime - 1)) * sprime;
  const hPrime = h / 60;
  const x = chroma * (1 - Math.abs(hPrime % 2 - 1));
  
  const m = lprime - chroma / 2;
  let [r, g, b] = [m, m, m]; // Initialize r, g, b with the lightness offset
  
  switch (Math.floor(hPrime)) {
    case 0: [r, g, b] = [chroma + m, x + m, m]; break;
    case 1: [r, g, b] = [x + m, chroma + m, m]; break;
    case 2: [r, g, b] = [m, chroma + m, x + m]; break;
    case 3: [r, g, b] = [m, x + m, chroma + m]; break;
    case 4: [r, g, b] = [x + m, m, chroma + m]; break;
    case 5: [r, g, b] = [chroma + m, m, x + m]; break;
    // No default case needed as hPrime is [0, 6)
  }
  
  // Ensure values are in the range [0, 255]
  const outRGB = {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
  
  return outRGB;
};

const labToCmyk = (l: number, a: number, b: number): cmyk => {
  const rgb: rgb = labToRgb(l, a, b);
  return rgbToCmyk(rgb.r, rgb.g, rgb.b);
};

const labToHex = (l: number, a: number, b: number): string => {
  const rgb: rgb = labToRgb(l, a, b);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
};

const labToHsl = (l: number, a: number, b: number): hsl => {
  const rgb: rgb = labToRgb(l, a, b);
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
};

const labToRgb = (l: number, a: number, b: number): rgb => {
  const xyz = labToXyz(l, a, b);
  return xyzToRgb(xyz.x, xyz.y, xyz.z);
};

const labToXyz = (l: number, a: number, b: number): xyz => {
  const y = (l + 16) / 116;
  const x = a / 500 + y;
  const z = y - b / 200;

  const xyz = [x, y, z].map((value) => {
    const valueCubed = Math.pow(value, 3);
    return valueCubed > 0.008856 ? valueCubed : (value - 16 / 116) / 7.787;
  });

  // Using D65 reference white
  const xRef = 95.047, yRef = 100.000, zRef = 108.883;
  return {
    x: xyz[0] * xRef,
    y: xyz[1] * yRef,
    z: xyz[2] * zRef
  };
};

const rgbToAny = (r: number, g: number, b: number, mode: mode): any => {
  switch (mode) {
    case 'cmyk':
      return {type: 'cmyk', color: rgbToCmyk(r, g, b)};
    case 'hex':
      return {type: 'hex', color: rgbToHex(r, g, b)};
    case 'hsl':
      return {type: 'hsl', color: rgbToHsl(r, g, b)};
    case 'lab':
      return {type: 'lab', color: rgbToLab(r, g, b)};
    case 'oklab':
      return {type: 'oklab', color: rgbToLab(r, g, b)};
    case 'rgb':
      return {type: 'rgb', color: {r: r, g: g, b: b}};
  }
};

const rgbToCmyk = (r: number, g: number, b: number): cmyk => {
  // Convert RGB components to the range of 0 to 1
  const rDecimal = r / 255;
  const gDecimal = g / 255;
  const bDecimal = b / 255;

  // Calculate CMY components
  const c = 1 - rDecimal;
  const m = 1 - gDecimal;
  const y = 1 - bDecimal;

  // Calculate K component
  const k = Math.min(c, Math.min(m, y));

  if (k === 1) { // Black
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  // Calculate remaining CMYK components
  const cmykC = ((c - k) / (1 - k)) * 100;
  const cmykM = ((m - k) / (1 - k)) * 100;
  const cmykY = ((y - k) / (1 - k)) * 100;
  const cmykK = k * 100;

  return {
    c: Math.round(cmykC),
    m: Math.round(cmykM),
    y: Math.round(cmykY),
    k: Math.round(cmykK)
  };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  let output = '#';
  output += r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
  return output;
};

const rgbToHsl = (r: number, g: number, b: number): hsl => {
  r /= 255, g /= 255, b /= 255;
  const max: number = Math.max(r, g, b), min: number = Math.min(r, g, b);
  let h: number, s: number, l: number;
  h = s = l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {h: h * 360, s: s * 100, l: l * 100};
}

const rgbToLab = (r: number, g: number, b: number): lab => {
  const xyz = rgbToXyz(r, g, b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}

const rgbToXyz = (r: number, g: number, b: number): xyz => {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  return {
    x: (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
    y: (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100,
    z: (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100
  };
};

const xyzToLab = (x: number, y: number, z: number): lab => {
  const xRef = 95.047, yRef = 100.000, zRef = 108.883;

  x /= xRef;
  y /= yRef;
  z /= zRef;

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

  return {
    l: (116 * y) - 16,
    a: 500 * (x - y),
    b: 200 * (y - z)
  }
};

const xyzToRgb = (x: number, y: number, z: number): rgb => {
    // Convert XYZ to RGB in the sRGB color space
    x /= 100; // X from 0 to  95.047      (Observer = 2°, Illuminant = D65)
    y /= 100; // Y from 0 to 100.000
    z /= 100; // Z from 0 to 108.883
  
    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b = x * 0.0557 + y * -0.2040 + z * 1.0570;
  
    // Assume sRGB
    [r, g, b] = [r, g, b].map((value) => {
      return value > 0.0031308
        ? 1.055 * Math.pow(value, 1 / 2.4) - 0.055
        : 12.92 * value;
    });
  
    return {
      r: Math.round(Math.max(0, Math.min(1, r)) * 255),
      g: Math.round(Math.max(0, Math.min(1, g)) * 255),
      b: Math.round(Math.max(0, Math.min(1, b)) * 255)
    };
};

export {
  anyConvert,
  anyToCmyk, anyToHex, anyToHsl, anyToLab, anyToRgb,
  cmykToRgb,
  hexToCmyk, hexToRgb, hexToHsl, hexToLab,
  hslToRgb,
  labToRgb, labToXyz,
  rgbToAny, rgbToHex, rgbToHsl, rgbToLab, rgbToXyz,
  xyzToRgb,
};
