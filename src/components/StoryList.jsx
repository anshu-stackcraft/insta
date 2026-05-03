export default function StoryList({ stories, seenLookup, onOpen }) {
  return (
    <div className="px-3 py-5">
      <div className="story-scroll flex gap-3 overflow-x-auto pb-2">
        {stories.map((story, index) => (
          <button
            key={story.id}
            type="button"
            onClick={() => onOpen(index)}
            className="shrink-0"
            aria-label={`Open story by ${story.username ?? `user_${story.id}`}`}
          >
            <div
              className={`rounded-full p-[2px] ${
                seenLookup.has(story.id)
                  ? "bg-zinc-500"
                  : "bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-600"
              }`}
            >
              <img
                src={story.avatar ?? story.image}
                alt={story.username ?? `user_${story.id}`}
                className="h-16 w-16 rounded-full border-2 border-black object-cover"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
