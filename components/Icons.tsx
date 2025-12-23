
import React from 'react';

interface IconProps {
  active?: boolean;
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

const DEFAULT_STROKE = 2.0;

export const IconHome: React.FC<IconProps> = ({ active, size = 24, className, strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M3 10.182V20a1 1 0 0 0 1 1h5v-6h4v6h5a1 1 0 0 0 1-1v-9.818M3 10.182L12 3l9 7.182" 
      stroke={active ? "#93CA76" : "#94A3B8"} 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill={active ? "#93CA7620" : "none"}
    />
  </svg>
);

export const IconLearning: React.FC<IconProps> = ({ active, size = 24, className, strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M12 2L21 7V17L12 22L3 17V7L12 2Z" 
      stroke={active ? "#93CA76" : "#94A3B8"} 
      strokeWidth={strokeWidth} 
      strokeLinejoin="round"
      fill={active ? "#93CA7620" : "none"}
    />
    <path d="M9 16L12 8L15 16M10 14H14" stroke={active ? "#93CA76" : "#94A3B8"} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconBookX: React.FC<IconProps> = ({ active, size = 24, className, strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path 
      d="M4 19.5V4.5C4 3.67 4.67 3 5.5 3H18.5C19.33 3 20 3.67 20 4.5V19.5C20 20.33 19.33 21 18.5 21H5.5C4.67 21 4 20.33 4 19.5Z" 
      stroke={active ? "#93CA76" : "#94A3B8"} 
      strokeWidth={strokeWidth}
      fill={active ? "#93CA7620" : "none"}
    />
    <path d="M4 17H20" stroke={active ? "#93CA76" : "#94A3B8"} strokeWidth={strokeWidth} />
    <path d="M10 8L14 12M14 8L10 12" stroke={active ? "#93CA76" : "#94A3B8"} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const IconDocument: React.FC<IconProps> = ({ active, size = 24, className, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke={active ? "#93CA76" : color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2V8H20" stroke={active ? "#93CA76" : color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 13H8" stroke={active ? "#93CA76" : color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17H8" stroke={active ? "#93CA76" : color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 9H8" stroke={active ? "#93CA76" : color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconUser: React.FC<IconProps> = ({ active, size = 24, className, strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="4" stroke={active ? "#93CA76" : "#94A3B8"} strokeWidth={strokeWidth} fill={active ? "#93CA7620" : "none"} />
    <path d="M20 21C20 17.13 16.87 14 13 14H11C7.13 14 4 17.13 4 21" stroke={active ? "#93CA76" : "#94A3B8"} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const IconCameraMain: React.FC<IconProps> = ({ size = 32, color = "white", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M23 19C23 20.1046 22.1046 21 21 21H3C1.89543 21 1 20.1046 1 19V8C1 6.89543 1.89543 6 3 6H7L9 3H15L17 6H21C22.1046 6 23 6.89543 23 8V19Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    <circle cx="12" cy="13" r="4" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const IconAnalyze: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
    <path d="M21 21L16.65 16.65" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M16 4L17 6L19 7L17 8L16 10L15 8L13 7L15 6L16 4Z" fill={color} />
  </svg>
);

export const IconImport: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 19V9C22 7.9 21.1 7 20 7H12L10 4H4C2.9 4 2.01 4.9 2.01 6L2 19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19Z" stroke={color} strokeWidth={strokeWidth} />
    <path d="M12 11V17M12 17L9 14M12 17L15 14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconMath: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 21H3V3L21 21Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    <path d="M7 21V19M11 21V17M15 21V15M3 7H5M3 11H7M3 15H9" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

export const IconPhysics: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    <ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth={strokeWidth} transform="rotate(45 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" stroke={color} strokeWidth={strokeWidth} transform="rotate(-45 12 12)" />
  </svg>
);

export const IconStar: React.FC<{ filled?: boolean }> = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#F5A623" : "none"} stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const IconPlus: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconMagic: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M15 4L17 2M15 4L13 2M15 4L17 6M15 4L13 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M4 20L13 11M4 20L2 22M4 20L6 22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <path d="M19 15L21 13M19 15L17 13M19 15L21 17M19 15L17 17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <circle cx="15" cy="11" r="2" fill={color} />
  </svg>
);

export const IconRobot: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="10" rx="2" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="8" cy="16" r="1.5" fill={color} />
    <circle cx="16" cy="16" r="1.5" fill={color} />
    <path d="M9 11V8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8V11" stroke={color} strokeWidth={strokeWidth} />
    <path d="M12 5V2" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const IconIdea: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 21H15M9 18H15M12 3C8.13401 3 5 6.13401 5 10C5 12.38 6.19 14.47 8 15.74V18H16V15.74C17.81 14.47 19 12.38 19 10C19 6.13401 15.866 3 12 3Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconTrophy: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 9H4.5C3.12 9 2 7.88 2 6.5C2 5.12 3.12 4 4.5 4H6M18 9H19.5C20.88 9 22 7.88 22 6.5C22 5.12 20.88 4 19.5 4H18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 4V10C6 13.31 8.69 16 12 16C15.31 16 18 13.31 18 10V4H6Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 16V21M8 21H16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconPrint: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 9V2H18V9M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18M18 14H18.01M6 14H18V22H6V14Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconShare: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 2L21.82 5.82M21.82 5.82L18 9.64M21.82 5.82H9C7.14 5.82 5.64 7.32 5.64 9.18V22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconSave: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 21V13H7V21M7 3V8H15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconMoon: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconTeacher: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M10 5C10 6.65685 8.65685 8 7 8C5.34315 8 4 6.65685 4 5C4 3.34315 5.34315 2 7 2C8.65685 2 10 3.34315 10 5Z" stroke={color} strokeWidth={strokeWidth} />
    <path d="M2 12C2 10.3431 3.34315 9 5 9H9C10.6569 9 12 10.3431 12 12V14H2V12Z" stroke={color} strokeWidth={strokeWidth} />
    <path d="M14 4H22M14 8H20M14 12H18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const IconFolder: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 19V9C22 7.89543 21.1046 7 20 7H11L9 4H4C2.89543 4 2 4.89543 2 6V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19Z" stroke={color} strokeWidth={strokeWidth} />
  </svg>
);

export const IconSearch: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth} />
    <path d="M21 21L16.65 16.65" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const IconSuccess: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <path d="M8 12L11 15L16 9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconSchedule: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} />
    <path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const IconTrendUp: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 6H23V12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconTrendDown: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M23 18L13.5 8.5L8.5 13.5L1 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 18H23V12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconFlag: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15ZM4 22V15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconChevronRight: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 18L15 12L9 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconUserCircle: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <circle cx="12" cy="10" r="3" stroke={color} strokeWidth={strokeWidth} />
    <path d="M7 20.662C7 19.13 10.33 18 12 18C13.67 18 17 19.13 17 20.662" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

export const IconEdit: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconEye: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconRefresh: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M23 4v6h-6M1 20v-6h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * 批改图标：主视觉包含对勾（表示批改完成/正确）+ 试卷/答题元素。
 */
export const IconGrade: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = DEFAULT_STROKE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* 试卷轮廓 */}
    <path 
      d="M16 2H5C3.89543 2 3 2.89543 3 4V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V7L16 2Z" 
      stroke={color} 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <path d="M16 2V7H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    {/* 试卷内答题线 */}
    <path d="M7 8h4M7 12h4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" opacity="0.3" />
    {/* 核心批改对勾元素 */}
    <path 
      d="M11 16.5l2.5 2.5 5-5" 
      stroke={color} 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);
