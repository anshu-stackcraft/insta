import { useCallback, useEffect, useRef, useState } from "react";
import ProgressBar from "./ProgressBar";

const STORY_DURATION_MS = 5000;
const HOLD_DELAY_MS = 150;

export default function StoryViewer({ stories, currentIndex, setCurrentIndex, onClose }) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const frameRef = useRef(null);
  const elapsedRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const pressStartRef = useRef(0);
  const holdTimeoutRef = useRef(null);
  const viewerRef = useRef(null);

  const story = stories[currentIndex];

  const next = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      elapsedRef.current = 0;
      setIsImageLoaded(false);
    } else {
      onClose();
    }
  }, [currentIndex, onClose, setCurrentIndex, stories.length]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      elapsedRef.current = 0;
      setIsImageLoaded(false);
    }
  }, [currentIndex, setCurrentIndex]);

  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) {
        window.clearTimeout(holdTimeoutRef.current);
      }
    };
  }, []);

  // Preload next image
  useEffect(() => {
    if (currentIndex >= stories.length - 1) return;

    const nextImage = new Image();
    nextImage.src = stories[currentIndex + 1].image;
  }, [currentIndex, stories]);

  // Animation loop
  useEffect(() => {
    const animate = (timestamp) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      if (!isPaused && isImageLoaded) {
        elapsedRef.current += timestamp - lastFrameTimeRef.current;
        const nextProgress = Math.min((elapsedRef.current / STORY_DURATION_MS) * 100, 100);
        setProgress(nextProgress);

        if (nextProgress >= 100) {
          next();
          return;
        }
      }

      lastFrameTimeRef.current = timestamp;
      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isImageLoaded, isPaused, next]);

  const handleNavigateTap = (clientX) => {
    if (isPaused) return;

    const bounds = viewerRef.current?.getBoundingClientRect();
    const splitX = bounds ? bounds.left + bounds.width / 2 : window.innerWidth / 2;

    if (clientX < splitX) {
      prev();
    } else {
      next();
    }
  };

  const startHold = () => {
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current);
    }
    pressStartRef.current = Date.now();
    holdTimeoutRef.current = window.setTimeout(() => {
      setIsPaused(true);
    }, HOLD_DELAY_MS);
  };

  const endHold = (event, shouldNavigate = true) => {
    if (holdTimeoutRef.current) {
      window.clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    const heldFor = Date.now() - pressStartRef.current;

    if (heldFor >= HOLD_DELAY_MS) {
      setIsPaused(false);
      return;
    }

    if (!shouldNavigate) return;

    const pointX =
      event.clientX ??
      event.changedTouches?.[0]?.clientX ??
      window.innerWidth / 2;

    handleNavigateTap(pointX);
  };

  return (
    <div
      ref={viewerRef}
      className="relative h-full w-full overflow-hidden bg-black select-none"
    >
      {/* Story Image */}
      <img
        src={story.image}
        alt={story.username ?? `story_${story.id}`}
        onLoad={() => setIsImageLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          isImageLoaded ? "opacity-100" : "opacity-0"
        }`}
        draggable={false}
      />

      <div className="absolute inset-0 bg-black/10" />

      {/* LEFT BUTTON */}
      {currentIndex > 0 && (
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 
                     bg-black/40 hover:bg-black/60 text-white 
                     rounded-full p-3"
        >
          ◀
        </button>
      )}

      {/* RIGHT BUTTON */}
      {currentIndex < stories.length - 1 && (
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 
                     bg-black/40 hover:bg-black/60 text-white 
                     rounded-full p-3"
        >
          ▶
        </button>
      )}

      {/* Tap / Hold Layer */}
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default z-10"
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerCancel={(event) => endHold(event, false)}
      />

      {/* Progress */}
      <ProgressBar
        currentIndex={currentIndex}
        progress={progress}
        total={stories.length}
      />

      {/* User Info */}
      <div className="absolute left-3 top-8 flex items-center gap-2 z-20">
        <img
          src={story.avatar ?? story.image}
          alt={story.username ?? `user_${story.id}`}
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="text-sm font-semibold text-white">
          {story.username ?? `user_${currentIndex + 1}`}
        </span>
        {story.timeAgo && (
          <span className="text-xs text-white/70">{story.timeAgo}</span>
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-7 text-2xl text-white z-20"
      >
        X
      </button>
    </div>
  );
}