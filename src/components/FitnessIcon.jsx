const muscleImages = {
  cardio: '/src/assets/muscles/cardio.png',
  glutes: '/src/assets/muscles/glutes.png',
  chest: '/src/assets/muscles/chest.png',
  shoulders: '/src/assets/muscles/shoulders.png',
  traps: '/src/assets/muscles/traps.png',
  biceps: '/src/assets/muscles/biceps.png',
  triceps: '/src/assets/muscles/triceps.png',
  forearm: '/src/assets/muscles/forearm.png',
  back: '/src/assets/muscles/back.png',
  abs: '/src/assets/muscles/abs.png',
  lowerback: '/src/assets/muscles/lowerback.png',
  quads: '/src/assets/muscles/quads.png',
  hamstrings: '/src/assets/muscles/hamstrings.png',
  abductors: '/src/assets/muscles/abductors.png',
  calves: '/src/assets/muscles/calves.png',
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
