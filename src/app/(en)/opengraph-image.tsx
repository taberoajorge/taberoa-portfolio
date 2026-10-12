import { OG_SIZE, ogImage } from '../../site/og';

export const alt = 'Alex Taberoa · Senior Software Engineer · Full-Stack AI Product Engineering';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function Image() {
  return ogImage('en');
}
