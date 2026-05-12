export default function FitnessIcon({ type, active = false }) {
  const stroke = active ? '#6ee7b7' : '#e4e4e7';
  const fill = active ? '#10b981' : '#52525b';
  const glow = active ? '#064e3b' : '#18181b';

  const Base = ({ children }) => (
    <svg viewBox="0 0 80 80" className="h-9 w-9" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="34" fill={glow} opacity="0.55" />
      {children}
    </svg>
  );

  const TorsoFront = ({ children }) => (
    <Base>
      <circle cx="40" cy="14" r="5" stroke={stroke} strokeWidth="3" />
      <path d="M25 24c5-5 25-5 30 0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M24 26c-5 11-5 26-1 40" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M56 26c5 11 5 26 1 40" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M31 28c-2 11-2 24 0 36" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
      <path d="M49 28c2 11 2 24 0 36" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
      {children}
    </Base>
  );

  const TorsoBack = ({ children }) => (
    <Base>
      <circle cx="40" cy="14" r="5" stroke={stroke} strokeWidth="3" />
      <path d="M25 24c5-5 25-5 30 0" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M24 27c-5 12-5 25-1 39" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M56 27c5 12 5 25 1 39" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 24v42" stroke={stroke} strokeWidth="2" strokeLinecap="round" opacity=".55" />
      {children}
    </Base>
  );

  const LegFront = ({ children }) => (
    <Base>
      <path d="M29 14c-5 18-4 36 1 53" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M51 14c5 18 4 36-1 53" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M29 14h22" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 15v51" stroke={stroke} strokeWidth="2" opacity=".45" />
      {children}
    </Base>
  );

  const LegBack = ({ children }) => (
    <Base>
      <path d="M30 14c-6 19-4 36 2 53" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 14c6 19 4 36-2 53" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 14h20" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <path d="M40 15v51" stroke={stroke} strokeWidth="2" opacity=".45" />
      {children}
    </Base>
  );

  const Arm = ({ part }) => (
    <Base>
      <path d="M25 19c13 3 22 13 25 27" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <path d="M50 46c1 10-5 18-16 23" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <path d="M34 69c-5 2-9 1-12-2" stroke={stroke} strokeWidth="3" strokeLinecap="round" />

      {part === 'biceps' && (
        <path d="M29 23c9 4 15 11 18 21" stroke={fill} strokeWidth="8" strokeLinecap="round" />
      )}

      {part === 'triceps' && (
        <path d="M50 46c1 8-3 15-10 20" stroke={fill} strokeWidth="8" strokeLinecap="round" />
      )}

      {part === 'forearm' && (
        <path d="M45 52c-2 7-6 12-12 16" stroke={fill} strokeWidth="8" strokeLinecap="round" />
      )}
    </Base>
  );

  const icons = {
    cardio: (
      <Base>
        <path
          d="M63 22c-7-8-19-7-23 4-4-11-16-12-23-4-8 10-2 23 7 32l16 16 16-16c9-9 15-22 7-32Z"
          stroke={stroke}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M14 42h13l5-11 9 24 6-13h19"
          stroke={fill}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Base>
    ),

    chest: (
      <TorsoFront>
        <path d="M25 33c7-8 15-7 15 1" stroke={fill} strokeWidth="9" strokeLinecap="round" />
        <path d="M55 33c-7-8-15-7-15 1" stroke={fill} strokeWidth="9" strokeLinecap="round" />
      </TorsoFront>
    ),

    shoulders: (
      <TorsoFront>
        <circle cx="24" cy="30" r="7" fill={fill} />
        <circle cx="56" cy="30" r="7" fill={fill} />
      </TorsoFront>
    ),

    traps: (
      <TorsoBack>
        <path
          d="M29 24l11 17 11-17"
          stroke={fill}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </TorsoBack>
    ),

    back: (
      <TorsoBack>
        <path d="M29 31c-7 10-9 22-6 34" stroke={fill} strokeWidth="9" strokeLinecap="round" />
        <path d="M51 31c7 10 9 22 6 34" stroke={fill} strokeWidth="9" strokeLinecap="round" />
      </TorsoBack>
    ),

    abs: (
      <TorsoFront>
        <rect x="33" y="35" width="14" height="29" rx="4" fill="#0b0f0d" stroke={fill} strokeWidth="4" />
        <path d="M33 44h14M33 53h14M40 35v29" stroke={fill} strokeWidth="2.5" />
      </TorsoFront>
    ),

    lowerback: (
      <TorsoBack>
        <path d="M27 58c8-6 18-6 26 0" stroke={fill} strokeWidth="10" strokeLinecap="round" />
      </TorsoBack>
    ),

    glutes: (
      <TorsoBack>
        <path d="M25 48c4-11 13-13 15-4" stroke={fill} strokeWidth="10" strokeLinecap="round" />
        <path d="M55 48c-4-11-13-13-15-4" stroke={fill} strokeWidth="10" strokeLinecap="round" />
      </TorsoBack>
    ),

    biceps: <Arm part="biceps" />,
    triceps: <Arm part="triceps" />,
    forearm: <Arm part="forearm" />,

    quads: (
      <LegFront>
        <path d="M31 19c-4 14-3 28 2 43" stroke={fill} strokeWidth="9" strokeLinecap="round" />
        <path d="M49 19c4 14 3 28-2 43" stroke={fill} strokeWidth="9" strokeLinecap="round" />
      </LegFront>
    ),

    hamstrings: (
      <LegBack>
        <path d="M32 19c-2 14-1 28 4 42" stroke={fill} strokeWidth="9" strokeLinecap="round" />
        <path d="M48 19c2 14 1 28-4 42" stroke={fill} strokeWidth="9" strokeLinecap="round" />
      </LegBack>
    ),

    abductors: (
      <LegFront>
        <path d="M28 25c-7 10-8 22-5 35" stroke={fill} strokeWidth="8" strokeLinecap="round" />
        <path d="M52 25c7 10 8 22 5 35" stroke={fill} strokeWidth="8" strokeLinecap="round" />
      </LegFront>
    ),

    calves: (
      <LegBack>
        <path d="M33 50c-4 6-5 12-4 18" stroke={fill} strokeWidth="9" strokeLinecap="round" />
        <path d="M47 50c4 6 5 12 4 18" stroke={fill} strokeWidth="9" strokeLinecap="round" />
      </LegBack>
    ),
  };

  return icons[type] || icons.biceps;
}
