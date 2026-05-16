import abductorsImage from '../assets/muscles/abductors.png';
import absImage from '../assets/muscles/abs.png';
import backImage from '../assets/muscles/back.png';
import bicepsImage from '../assets/muscles/biceps.png';
import calvesImage from '../assets/muscles/calves.png';
import cardioImage from '../assets/muscles/cardio.png';
import chestImage from '../assets/muscles/chest.png';
import forearmImage from '../assets/muscles/forearm.png';
import glutesImage from '../assets/muscles/glutes.png';
import hamstringsImage from '../assets/muscles/hamstrings.png';
import lowerbackImage from '../assets/muscles/lowerback.png';
import quadsImage from '../assets/muscles/quads.png';
import shouldersImage from '../assets/muscles/shoulders.png';
import trapsImage from '../assets/muscles/traps.png';
import tricepsImage from '../assets/muscles/triceps.png';

const muscleImages = {
  cardio: cardioImage,
  glutes: glutesImage,
  chest: chestImage,
  shoulders: shouldersImage,
  traps: trapsImage,
  biceps: bicepsImage,
  triceps: tricepsImage,
  forearm: forearmImage,
  back: backImage,
  abs: absImage,
  lowerback: lowerbackImage,
  quads: quadsImage,
  hamstrings: hamstringsImage,
  abductors: abductorsImage,
  calves: calvesImage,
};

export default function FitnessIcon({ type, active = false }) {
  const src = muscleImages[type] || muscleImages.biceps;

  return (
    <div
      className={`h-14 w-14 overflow-hidden rounded-2xl border ${
        active
          ? 'border-emerald-400/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
          : 'border-white/10 bg-zinc-950'
      }`}
    >
      <img
        src={src}
        alt=""
        className={`h-full w-full object-cover transition duration-300 ${
          active ? 'scale-110 opacity-100' : 'opacity-80'
        }`}
      />
    </div>
  );
}
