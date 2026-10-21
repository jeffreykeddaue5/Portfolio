// ===== Entry template =====
// 1. Copy this file and rename it
//    e.g. posts/2026-11-01-my-project.js  — use letters/numbers/hyphens; it becomes the URL
// 2. Add "2026-11-01-my-project" to posts/list.js
// 3. Put images/videos in media/

post({
  title: "Entry title",
  date: "2026-11-01",
  category: "projects",         // "work" | "projects" | "updates"
  tags: ["tag1", "tag2"],
  // summary: "Short summary for lists (defaults to the first paragraph)",
  // cover:   "media/my-post/cover.jpg",   // small image shown in lists (optional)
  // draft:   true,                        // true hides the entry (draft)

  content: [
    // A plain string = a paragraph. <b>bold</b>, <i>italic</i>, <a href="...">links</a> work too.
    "First paragraph.",
    "Second paragraph.",

    { heading: "Subheading" },
    { quote: "A quote" },

    // Image / GIF (GIFs work as image too)
    { image: "media/my-post/photo.jpg", caption: "Caption" },
    { image: "media/my-post/funny.gif" },

    // Several images
    { gallery: ["media/my-post/1.jpg", "media/my-post/2.jpg", "media/my-post/3.jpg"] },

    // Video (mp4/webm). gif: true autoplays muted on loop, like a GIF
    { video: "media/my-post/clip.mp4", caption: "Caption" },
    { video: "media/my-post/loop.mp4", gif: true },

    // YouTube (the ID after v= in the URL)
    { youtube: "dQw4w9WgXcQ" },

    // Any other HTML
    { html: "<hr>" },
  ],
});
