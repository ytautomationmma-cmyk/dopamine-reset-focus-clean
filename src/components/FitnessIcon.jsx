export default function FitnessIcon({ type, active = false }) {
  const stroke = active ? '#6ee7b7' : '#e4e4e7';
  const muted = active ? '#064e3b' : '#18181b';
  const fill = active ? '#10b981' : '#27272a';
  const Base = ({ children }) => <svg viewBox="0 0 64 64" className="h-8 w-8" fill="none" aria-hidden="true">{children}</svg>;
  const BodyFront = ({ highlight }) => <Base><circle cx="32" cy="9" r="5" stroke={stroke} strokeWidth="3" /><path d="M22 18c3-3 17-3 20 0" stroke={stroke} strokeWidth="3" strokeLinecap="round" /><path d="M21 19c-4 7-5 18-2 31" stroke={stroke} strokeWidth="3" strokeLinecap="round" /><path d="M43 19c4 7 5 18 2 31" stroke={stroke} strokeWidth="3" strokeLinecap="round" /><path d="M26 21c-2 8-2 20 0 31" stroke={stroke} strokeWidth="3" strokeLinecap="round" /><path d="M38 21c2 8 2 20 0 31" stroke={stroke} strokeWidth="3" strokeLinecap="round" />{highlight}</Base>;
  const BodyBack = ({ highlight }) => <Base><circle cx="32" cy="9" r="5" stroke={stroke} strokeWidth="3" /><path d="M22 18c3-3 17-3 20 0" stroke={stroke} strokeWidth="3" strokeLinecap="round" /><path d="M21 20c-4 8-5 18-2 31" stroke={stroke} strokeWidth="3" strokeLinecap="round" /><path d="M43 20c4 8 5 18 2 31" stroke={stroke} strokeWidth="3" strokeLinecap="round" /><path d="M32 18v35" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity="0.7" />{highlight}</Base>;
  const LegFront = ({ highlight }) => <Base><path d="M24 8c-3 12-2 27 2 48" stroke={stroke} strokeWidth="3" strokeLinecap="round" /><path d="M40 8c3 12 2 27-2 48" stroke={stroke} strokeWidth="3" strokeLinecap="round" /><path d="M24 8h16" stroke={stroke} strokeWidth="3" strokeLinecap="round" />{highlight}</Base>;
  const LegBack = ({ highlight }) => <Base><path d="M25 8c-4 14-2 31 3 48" stroke={stroke} strokeWidth="3" strokeLinecap="round" /><path d="M39 8c4 14 2 31-3 48" stroke={stroke} strokeWidth="3" strokeLinecap="round" /><path d="M25 8h14" stroke={stroke} strokeWidth="3" strokeLinecap="round" />{highlight}</Base>;
  const ArmIcon = ({ highlight }) => <Base><path d="M20 12c9 2 15 8 17 16" stroke={stroke} strokeWidth="4" strokeLinecap="round" /><path d="M37 28c2 8-2 16-10 21" stroke={stroke} strokeWidth="4" strokeLinecap="round" /><path d="M28 49c-3 2-6 1-8-1" stroke={stroke} strokeWidth="3" strokeLinecap="round" />{highlight === 'upper' && <path d="M24 16c7 3 11 8 13 14" stroke={fill} strokeWidth="6" strokeLinecap="round" />}{highlight === 'back' && <path d="M38 30c1 6-2 12-7 16" stroke={fill} strokeWidth="6" strokeLinecap="round" />}{highlight === 'forearm' && <path d="M34 33c-1 6-4 11-9 15" stroke={fill} strokeWidth="6" strokeLinecap="round" />}</Base>;
  const icons = {
    cardio: <Base><path d="M51 16c-5-6-14-5-19 2-5-7-14-8-19-2-6 7-2 17 5 24l14 14 14-14c7-7 11-17 5-24Z" stroke={stroke} strokeWidth="3" strokeLinejoin="round" /><path d="M11 33h10l4-8 7 18 5-10h16" stroke={fill} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></Base>,
    glutes: <BodyBack highlight={<><path d="M22 36c2-7 8-9 10-3" stroke={fill} strokeWidth="6" strokeLinecap="round" /><path d="M42 36c-2-7-8-9-10-3" stroke={fill} strokeWidth="6" strokeLinecap="round" /></>} />,
    chest: <BodyFront highlight={<><path d="M22 25c5-5 10-5 10 1" stroke={fill} strokeWidth="6" strokeLinecap="round" /><path d="M42 25c-5-5-10-5-10 1" stroke={fill} strokeWidth="6" strokeLinecap="round" /></>} />,
    shoulders: <BodyFront highlight={<><circle cx="20" cy="22" r="5" fill={fill} /><circle cx="44" cy="22" r="5" fill={fill} /></>} />,
    traps: <BodyBack highlight={<path d="M25 18l7 10 7-10" stroke={fill} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />} />,
    biceps: <ArmIcon highlight="upper" />,
    triceps: <ArmIcon highlight="back" />,
    forearm: <ArmIcon highlight="forearm" />,
    back: <BodyBack highlight={<><path d="M24 24c-4 8-5 16-3 25" stroke={fill} strokeWidth="6" strokeLinecap="round" /><path d="M40 24c4 8 5 16 3 25" stroke={fill} strokeWidth="6" strokeLinecap="round" /></>} />,
    abs: <BodyFront highlight={<><rect x="27" y="25" width="10" height="24" rx="3" fill={muted} stroke={fill} strokeWidth="3" /><path d="M27 33h10M27 41h10M32 25v24" stroke={fill} strokeWidth="2" /></>} />,
    lowerback: <BodyBack highlight={<path d="M24 46c5-4 11-4 16 0" stroke={fill} strokeWidth="6" strokeLinecap="round" />} />,
    quads: <LegFront highlight={<><path d="M26 12c-2 12-1 24 2 36" stroke={fill} strokeWidth="6" strokeLinecap="round" /><path d="M38 12c2 12 1 24-2 36" stroke={fill} strokeWidth="6" strokeLinecap="round" /></>} />,
    hamstrings: <LegBack highlight={<><path d="M27 14c-1 10 0 20 3 32" stroke={fill} strokeWidth="6" strokeLinecap="round" /><path d="M37 14c1 10 0 20-3 32" stroke={fill} strokeWidth="6" strokeLinecap="round" /></>} />,
    abductors: <LegFront highlight={<><path d="M24 20c-4 6-5 14-4 23" stroke={fill} strokeWidth="5" strokeLinecap="round" /><path d="M40 20c4 6 5 14 4 23" stroke={fill} strokeWidth="5" strokeLinecap="round" /></>} />,
    calves: <LegBack highlight={<><path d="M28 40c-2 6-2 11-1 16" stroke={fill} strokeWidth="6" strokeLinecap="round" /><path d="M36 40c2 6 2 11 1 16" stroke={fill} strokeWidth="6" strokeLinecap="round" /></>} />,
  };
  return icons[type] || icons.biceps;
}
