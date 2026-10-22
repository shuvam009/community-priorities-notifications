import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { communityApi } from "../services/communityApi.js";

const demoPosts = [
  {
    _id: "demo-1",
    title: "Ward 42 drainage review is underway",
    body: "The technical team inspected the drainage route and is preparing a repair schedule before monsoon.",
    category: "Water Supply",
    createdAt: "2026-10-21",
    reviews: [
      { rating: 5, text: "Thank you for sharing the update." },
      { rating: 4, text: "Please publish the repair start date too." },
    ],
  },
];

export default function CommunityHistory() {
  const [posts, setPosts] = useState(demoPosts);
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "Community update",
  });
  const [message, setMessage] = useState(
    "Demo data shown until the API and admin token are connected.",
  );
  useEffect(() => {
    communityApi
      .getPosts()
      .then((data) => {
        setPosts(data);
        setMessage("Live data from Community API.");
      })
      .catch(() => {});
  }, []);
  async function publish(event) {
    event.preventDefault();
    try {
      const post = await communityApi.createPost(form);
      setPosts((current) => [post, ...current]);
      setForm({ title: "", body: "", category: "Community update" });
      setMessage("Community post published.");
    } catch (error) {
      setMessage(error.message);
    }
  }
  return (
    <main className="history-admin-page">
      <header className="page-top">
        <Link to="/admin/voting">← Voting workspace</Link>
        <p>COMMUNITY MANAGEMENT</p>
        <h1>Community history</h1>
        <span>
          Publish city updates and read the reviews citizens leave on them.
        </span>
      </header>
      <p className="api-message">{message}</p>
      <section className="post-composer">
        <div>
          <p>CREATE COMMUNITY POST</p>
          <h2>Share an update with citizens</h2>
        </div>
        <form onSubmit={publish}>
          <input
            placeholder="Post title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option>Community update</option>
            <option>Roads & Traffic</option>
            <option>Street Lighting</option>
            <option>Water Supply</option>
            <option>Waste Management</option>
            <option>Electricity</option>
            <option>Public Safety</option>
            <option>Other</option>
          </select>
          <textarea
            placeholder="Write a clear update for the community..."
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            required
            rows="4"
          />
          <button>Publish community post</button>
        </form>
      </section>
      <section className="post-history">
        <div className="history-section-title">
          <p>PUBLISHED POSTS</p>
          <h2>Reviews and community comments</h2>
        </div>
        {posts.map((post) => (
          <article className="community-post" key={post._id}>
            <header>
              <span>{post.category}</span>
              <time>
                {new Date(post.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </time>
            </header>
            <h3>{post.title}</h3>
            <p>{post.body}</p>
            <div className="review-list">
              <b>{post.reviews?.length || 0} citizen reviews</b>
              {(post.reviews || []).map((review, index) => (
                <div key={index}>
                  <span>{"★".repeat(review.rating || 0)}</span>
                  <p>{review.text}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
