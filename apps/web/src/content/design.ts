import kitchen from '../assets/projects/stock-kitchen-30580858.jpg';
import designer from '../assets/projects/stock-design-6580553.jpg';
import dining from '../assets/projects/stock-kitchen-7166644.jpg';
import bathroom from '../assets/projects/stock-bathroom-5906348.jpg';
import renovation from '../assets/projects/stock-renovation-4756490.jpg';
import room from '../assets/projects/stock-renovation-15798784.jpg';

// Draft design imagery only. Replace with Erik's project photography before publication.
// Stock sources and replacement checklist: docs/content/design-imagery.md.
export const images = { kitchen, dining, bathroom, renovation, room, designer };
export const services = [
  { id: 'kitchen', title: 'Kitchens', href: '/kitchen-remodeling/', image: kitchen, alt: 'Warm wood kitchen with a dark island and natural finishes', description: 'A better place to cook, gather, and start the day.' },
  { id: 'bathroom', title: 'Bathrooms', href: '/bathroom-remodeling/', image: bathroom, alt: 'Freestanding bathtub beside tall windows', description: 'Thoughtful storage. Beautiful finishes. Room to unwind.' },
  { id: 'whole-home', title: 'Whole-Home Remodeling', href: '/whole-home-remodeling/', image: dining, alt: 'Light-filled kitchen and dining space', description: 'Bring every room into the same conversation.' },
  { id: 'additions', title: 'Additions', href: '/additions/', image: room, alt: 'A bright room being prepared for renovation', description: 'More room for life, with a plan that fits your home.' },
  { id: 'adu', title: 'ADUs', href: '/adu-mother-in-law/', image: dining, alt: 'Open kitchen and dining area with pale cabinetry', description: 'Independent living, close to the people who matter.' },
  { id: 'home-repair', title: 'Home Repair', href: '/home-repair/', image: renovation, alt: 'Exposed framing inside a home under renovation', description: 'Careful repairs that keep your home working well.' },
];
export const process = [
  { title: 'Consult', text: 'Tell us how you live and what needs to change. We talk through your goals, scope, and investment.' },
  { title: 'Design', text: 'Work with our in-house designer on floorplans and a 3D walkthrough. See the space before we build it.' },
  { title: 'Selections', text: 'Choose cabinetry, fixtures, and finishes together. The details belong in the plan, before construction starts.' },
  { title: 'Build', text: 'With the design approved, we bring it to life. A clear plan keeps the work and the conversation moving.' },
  { title: 'Walkthrough', text: 'Walk the finished space with us. We review the details together and make sure you know your new home.' },
];
