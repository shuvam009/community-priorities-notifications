import { useState } from "react";
import { Link } from "react-router-dom";
import { communityApi } from "../services/communityApi.js";

export default function CitizenAnnouncements() {
  const [form, setForm] = useState({ title: "", message: "" });
  const [notice, setNotice] = useState(
    "Publish a city announcement to send it to every citizen's notification bell.",
  );

  async function publishAnnouncement(event) {
    event.preventDefault();
    try {
      await communityApi.createAnnouncement(form);
      setForm({ title: "", message: "" });
      setNotice(
        "Announcement published. Citizens will see it in their notifications.",
      );
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <main className="history-admin-page">
      <header className="page-top">
        <Link to="/admin/voting">← Voting workspace</Link>
        <p>CITIZEN COMMUNICATION</p>
        <h1>City announcements</h1>
        <span>Send important city information directly to all citizens.</span>
      </header>
      <p className="api-message">{notice}</p>
      <section className="post-composer announcement-composer">
        <div>
          <p>NEW ANNOUNCEMENT</p>
          <h2>Notify the community</h2>
          <span>
            Use this for service alerts, city notices, and other community-wide
            updates.
          </span>
        </div>
        <form onSubmit={publishAnnouncement}>
          <input
            required
            value={form.title}
            maxLength="100"
            placeholder="Announcement title"
            onChange={(event) =>
              setForm({ ...form, title: event.target.value })
            }
          />
          <div className="announcement-audience">All citizens</div>
          <textarea
            required
            rows="6"
            maxLength="250"
            value={form.message}
            placeholder="Write the city announcement..."
            onChange={(event) =>
              setForm({ ...form, message: event.target.value })
            }
          />
          <button type="submit">Publish announcement</button>
        </form>
      </section>
    </main>
  );
}
