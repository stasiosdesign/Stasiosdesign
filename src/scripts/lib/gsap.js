// GSAP with the plugins the site uses, registered once. Everything imports
// GSAP from here so registration can never be forgotten or repeated.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, CustomEase);

export { gsap, ScrollTrigger, CustomEase };
