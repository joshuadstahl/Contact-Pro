import type { Config } from "tailwindcss";
// import { Assistant } from "next/font/google";
// const assistant = Assistant(
//     { 
//         subsets: ["latin"]
//     }
// );


const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      'persian_green': {
        '50': '#f1fcf9',
        '100': '#d1f6f0',
        '200': '#a2ede1',
        '300': '#6cdccf',
        '400': '#3ec3b8',
        DEFAULT: '#229b93',
        '600': '#1b8682',
        '700': '#196c69',
        '800': '#195655',
        '900': '#194847',
        '950': '#082a2b',
      },
      'moss_green': {
        '50': '#f4f4f1',
        '100': '#e7e6e0',
        '200': '#d2d1c4',
        '300': '#b6b5a0',
        DEFAULT: '#919073',
        '500': '#7f7e63',
        '600': '#64644c',
        '700': '#4e4e3d',
        '800': '#404034',
        '900': '#38382f',
        '950': '#1d1d16',
      },
      'persian_orange': {
        '50': '#faf6f2',
        '100': '#f4eae0',
        '200': '#e9d3bf',
        '300': '#dbb596',
        DEFAULT: '#c88b63',
        '500': '#c0774f',
        '600': '#b26444',
        '700': '#944f3a',
        '800': '#784134',
        '900': '#61372d',
        '950': '#341b16',
      },
      'coral': {
        '50': '#fff4ed',
        '100': '#ffe6d4',
        '200': '#ffc9a8',
        '300': '#ffa471',
        DEFAULT: '#ff8552',
        '500': '#fe4d11',
        '600': '#ef3307',
        '700': '#c62108',
        '800': '#9d1d0f',
        '900': '#7e1b10',
        '950': '#440906',
      },
      'charcoal': {
        '50': '#f2f7f9',
        '100': '#deeaef',
        '200': '#c2d6df',
        '300': '#97b9c9',
        '400': '#6594ab',
        '500': '#4a7890',
        '600': '#40637a',
        '700': '#395365',
        DEFAULT: '#364958',
        '900': '#2f3e4a',
        '950': '#1c2630',
      },
      'cadet_gray': {
        '50': '#f8f9fa',
        '100': '#f2f3f5',
        '200': '#e7eaed',
        '300': '#d4d9de',
        '400': '#bcc3c9',
        DEFAULT: '#97a0ac',
        '600': '#88909f',
        '700': '#757d8c',
        '800': '#626975',
        '900': '#515761',
        '950': '#353940',
      },
      'french_gray': {
        '50': '#f6f7f8',
        '100': '#eaebef',
        '200': '#d9dce4',
        DEFAULT: '#c7ccd6',
        '400': '#a1a9b9',
        '500': '#8991a8',
        '600': '#787e98',
        '700': '#6b6f8a',
        '800': '#5b5d72',
        '900': '#4b4e5d',
        '950': '#31323a',
      },
      'ghost_white': {
        DEFAULT: '#f7f7ff',
        '100': '#e9e9fe',
        '200': '#d6d6fe',
        '300': '#b8b5fd',
        '400': '#948bfa',
        '500': '#715cf6',
        '600': '#5e3aed',
        '700': '#4f28d9',
        '800': '#4221b6',
        '900': '#381d95',
        '950': '#201065',
      },
      'tiffany_blue': {
        '50': '#f0fbfa',
        '100': '#d8f5f4',
        '200': '#b6ebea',
        DEFAULT: '#92e0df',
        '400': '#4bc5c5',
        '500': '#2fa9ab',
        '600': '#2a8990',
        '700': '#286f76',
        '800': '#285b62',
        '900': '#254d54',
        '950': '#143338',
      },
      'robin_egg_blue' : {
        '50': '#f0fdfb',
        '100': '#cdfaf4',
        '200': '#9af5e8',
        '300': '#60e8db',
        DEFAULT: '#2cc9be',
        '500': '#16b6ad',
        '600': '#0f928d',
        '700': '#117473',
        '800': '#125d5c',
        '900': '#144d4c',
        '950': '#052d2e',
      },
      'black':'#000',
      'white':'#FFF',
      'online_green' : '#00D16C',
      'offline_gray' : '#888888',
      'do_not_disturb' : "#FF0000",
      'small-icon-border':'rgb (0,0,0,10%)',
    },
    fontFamily: {
      "sans": ['Heebo', 'sans-serif']
    },
    extend: {
      fontSize: {
        xxs: "0.625rem"
      },
      borderRadius: {
        'my':'0.625rem',
        '5px':'0.3125rem'
      },
      borderWidth: {
        'xs':'0.5px',
        '1': '1px',
        '3': '3px',
        '6': '6px',
      },
      boxShadow: {
        'notify': '0 0 7px 2px rgba(0, 0, 0, 0.15)',
      }
    }
  },
  
  plugins: [],
};
export default config;
