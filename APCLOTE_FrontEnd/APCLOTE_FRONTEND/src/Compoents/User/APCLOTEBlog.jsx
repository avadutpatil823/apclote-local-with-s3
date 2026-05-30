import React from "react";

const blogPosts = [
  {
    id: 1,
    title: "Top 5 Tips to Crack Online Exams",
    snippet: "Focus on the exam pattern, practice with mock tests, manage time well, and keep your setup reliable before exam day.",
    date: "2025-10-18",
    image: "https://images.pexels.com/photos/1181351/pexels-photo-1181351.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  },
  {
    id: 2,
    title: "Why Online Learning is the Future",
    snippet: "Flexible learning, instant access, and better use of digital resources are changing how students build skills.",
    date: "2025-10-15",
    image: "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2022/03/what-is-a-blog-1.png",
  },
  {
    id: 3,
    title: "Time Management for Students",
    snippet: "Prioritize what matters, break work into smaller blocks, and reduce distractions to protect your focus.",
    date: "2025-10-12",
    image: "https://www.hostinger.com/in/tutorials/wp-content/uploads/sites/52/2018/08/how-to-start-a-blog-2.png",
  },
  {
    id: 4,
    title: "How to Stay Motivated While Studying",
    snippet: "Small goals, visible progress, and a study routine that feels sustainable can keep motivation from dropping.",
    date: "2025-10-10",
    image: "https://www.hubspot.com/hubfs/Benefits%20of%20Business%20Blogging.webp",
  },
  {
    id: 5,
    title: "Best Study Apps for Students",
    snippet: "Digital tools for notes, flashcards, and planning can make revision more organized and less overwhelming.",
    date: "2025-10-08",
    image: "https://www.hubspot.com/hubfs/31%20business%20stuff.png",
  },
  {
    id: 6,
    title: "How to Prepare for Competitive Exams",
    snippet: "Understand the syllabus early, revisit weak areas often, and test yourself under realistic timing.",
    date: "2025-10-05",
    image: "https://www.hubspot.com/hubfs/blogs-Jan-05-2024-05-12-25-3281-PM.png",
  },
];

const APCLOTEBlog = () => {
  return (
    <div className="page-shell">
      <div className="page-content space-y-8">
        <section className="section-hero">
          <span className="eyebrow">Blog</span>
          <h1 className="section-title mt-5">Study ideas, learning strategies, and practical preparation advice.</h1>
          <p className="section-subtitle mt-4 max-w-3xl">
            Browse short reads designed to help students build stronger habits and make smarter progress.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.id} className="dashboard-card overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-56 object-cover" />
              <div className="p-6 flex flex-col gap-4">
                <span className="pill-tag w-fit">{post.date}</span>
                <h2 className="text-2xl font-semibold text-teal-900">{post.title}</h2>
                <p className="subtle-text">{post.snippet}</p>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default APCLOTEBlog;
