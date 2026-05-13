import cardio from '../assets/muscles/cardio.png';
import glutes from '../assets/muscles/glutes.png';
import chest from '../assets/muscles/chest.png';
import shoulders from '../assets/muscles/shoulders.png';
import traps from '../assets/muscles/traps.png';
import biceps from '../assets/muscles/biceps.png';
import triceps from '../assets/muscles/triceps.png';
import forearm from '../assets/muscles/forearm.png';
import back from '../assets/muscles/back.png';
import abs from '../assets/muscles/abs.png';
import lowerback from '../assets/muscles/lowerback.png';
import quads from '../assets/muscles/quads.png';
import hamstrings from '../assets/muscles/hamstrings.png';
import abductors from '../assets/muscles/abductors.png';
import calves from '../assets/muscles/calves.png';

const muscleImages = {
  cardio,
  glutes,
  chest,
  shoulders,
  traps,
  biceps,
  triceps,
  forearm,
  back,
  abs,
  lowerback,
  quads,
  hamstrings,
  abductors,
  calves,
};

export default function FitnessIcon({ type, active = false }) {
  const src = muscleImages[type] || biceps;

  return (
    <div
      className={`h-16 w-16 overflow-hidden rounded-2xl border ${
        active
          ? 'border-emerald-400/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
          : 'border-white/10 bg-zinc-950'
      }`}
    >
      <img
        src={src}
        alt=""
        className={`h-full w-full object-cover transition duration-300 ${
          active ? 'scale-110 opacity-100' : 'opacity-90'
        }`}
      />
    </div>
  );
}
