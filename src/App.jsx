import { useMemo, useState } from "react";
import StoryList from "./components/StoryList";
import StoryViewer from "./components/StoryViewer";
import stories from "./data/stories.json";

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(null);
  const [seenStoryIds, setSeenStoryIds] = useState([]);

  const seenLookup = useMemo(() => new Set(seenStoryIds), [seenStoryIds]);

  const markSeen = (storyId) => {
    setSeenStoryIds((prev) => (prev.includes(storyId) ? prev : [...prev, storyId]));
  };

  const handleOpen = (index) => {
    markSeen(stories[index].id);
    setCurrentIndex(index);
  };

  const handleIndexChange = (index) => {
    markSeen(stories[index].id);
    setCurrentIndex(index);
  };

  return (
    <div className="min-h-dvh bg-zinc-900 text-white">
      <div className="mx-auto h-dvh max-w-[400px] bg-black">
        {currentIndex === null ? (
          <StoryList stories={stories} seenLookup={seenLookup} onOpen={handleOpen} />
        ) : (
          <StoryViewer
            key={currentIndex}
            stories={stories}
            currentIndex={currentIndex}
            setCurrentIndex={handleIndexChange}
            onClose={() => setCurrentIndex(null)}
          />
        )}
      </div>
    </div>
  );
}
