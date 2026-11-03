import type { SVGProps } from 'react';

/** Small inline icon set (no icon library). Decorative: always paired with a visible text label. */
type IconProps = SVGProps<SVGSVGElement>;
const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false } as const;

export const DeskIcon = (p: IconProps) => (<svg {...base} {...p}><rect x="4" y="4" width="10" height="10" rx="1" transform="rotate(-6 9 9)" /><path d="M13 10h7v10h-10v-4" /></svg>);
export const PencilIcon = (p: IconProps) => (<svg {...base} {...p}><path d="M4 20l1-4L16 5l3 3L8 19z" /><path d="M14 7l3 3" /></svg>);
export const ResultsIcon = (p: IconProps) => (<svg {...base} {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>);
export const ClassIcon = (p: IconProps) => (<svg {...base} {...p}><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 20c0-2.5 1.3-5 3-5s4 2 4 5" /></svg>);
export const OverviewIcon = (p: IconProps) => (<svg {...base} {...p}><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="5" rx="1" /><rect x="13" y="10" width="8" height="11" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /></svg>);
export const GapsIcon = (p: IconProps) => (<svg {...base} {...p}><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>);
export const PlanIcon = (p: IconProps) => (<svg {...base} {...p}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h5" /></svg>);
export const TodayIcon = (p: IconProps) => (<svg {...base} {...p}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>);
export const PracticeIcon = (p: IconProps) => (<svg {...base} {...p}><path d="M4 6h16M4 12h10M4 18h7" /><path d="M17 15l2 2 3-4" /></svg>);
export const ProgressIcon = (p: IconProps) => (<svg {...base} {...p}><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" /></svg>);
export const HelpIcon = (p: IconProps) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01" /></svg>);
export const BackIcon = (p: IconProps) => (<svg {...base} {...p}><path d="M15 5l-7 7 7 7" /></svg>);
