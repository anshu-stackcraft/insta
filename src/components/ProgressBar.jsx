export default function ProgressBar({ currentIndex, progress, total }) {
  return (
    <div className="absolute left-0 top-3 flex w-full gap-1 px-2">
      {Array.from({ length: total }).map((_, index) => {
        let width = 0;

        if (index < currentIndex) {
          width = 100;
        } else if (index === currentIndex) {
          width = progress;
        }

        return (
          <div key={index} className="h-1 flex-1 overflow-hidden rounded bg-white/35">
            <div
              className="h-full rounded bg-white transition-[width] duration-75 ease-linear"
              style={{ width: `${width}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
