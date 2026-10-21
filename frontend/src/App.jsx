
import { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:5000/api/news';

function App() {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({
    title: '', category: 'Technology',
    author: '', content: '', image: ''
  });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');

  async function loadNews() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error('Unable to load news');
      setNews(await res.json());
    } catch {
      setMessage('Cannot connect to backend. Check port 5000.');
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(
        editId ? `${API}/${editId}` : API,
        {
          method: editId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      setMessage(editId ? 'Article updated!' : 'News published!');
      setForm({
        title: '', category: 'Technology',
        author: '', content: '', image: ''
      });
      setEditId(null);
      await loadNews();
    } catch (err) {
      setMessage(err.message);
    }
  }

  function editArticle(article) {
    setEditId(article._id);
    setForm({
      title: article.title,
      category: article.category,
      author: article.author,
      content: article.content,
      image: article.image || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteArticle(id) {
    if (!window.confirm('Delete this news article?')) return;

    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setMessage('Article deleted successfully.');
      await loadNews();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand"><span>DAILY</span>POST<span className="dot">.</span></div>
        <nav>
          <a href="#home">Home</a>
          <a href="#latest">Latest News</a>
          <a href="#publish">Publish News</a>
        </nav>
      </header>

      <div className="breaking">
        <strong>BREAKING NEWS</strong>
        <span>Stay informed. Stay ahead. Get the latest updates with DAILYPOST.</span>
      </div>

      <main id="home">
        <section className="hero">
          <p className="eyebrow">YOUR WORLD. YOUR NEWS.</p>
          <h1>The stories that<br />matter <span>today.</span></h1>
          <p>Fresh perspectives, important updates and headlines from around the world.</p>
          <a className="hero-btn" href="#latest">Explore Latest News ↓</a>
        </section>

        <section id="publish" className="publish-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EDITOR'S DESK</p>
              <h2>{editId ? 'Edit Article' : 'Publish a Story'}</h2>
            </div>
            <span className="live"><i /> LIVE EDITOR</span>
          </div>

          <form onSubmit={handleSubmit} className="news-form">
            <input name="title" placeholder="News headline" value={form.title} onChange={handleChange} required />
            <div className="form-row">
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Technology</option>
                <option>World</option>
                <option>Politics</option>
                <option>Business</option>
                <option>Sports</option>
                <option>Entertainment</option>
                <option>Education</option>
              </select>
              <input name="author" placeholder="Author name" value={form.author} onChange={handleChange} required />
            </div>
            <input name="image" placeholder="Image URL (optional)" value={form.image} onChange={handleChange} />
            <textarea name="content" placeholder="Write your full news story..." value={form.content} onChange={handleChange} rows="5" required />
            <div className="form-actions">
              <button className="primary-btn" type="submit">{editId ? 'Save Changes' : 'Publish Article'} ↗</button>
              {editId && <button type="button" className="cancel-btn" onClick={() => {
                setEditId(null);
                setForm({ title: '', category: 'Technology', author: '', content: '', image: '' });
              }}>Cancel</button>}
            </div>
          </form>
          {message && <p className="message">{message}</p>}
        </section>

        <section id="latest" className="latest-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">WHAT'S HAPPENING</p>
              <h2>Latest Headlines<span className="dot">.</span></h2>
            </div>
            <span className="count">{news.length} ARTICLES</span>
          </div>

          {news.length === 0 ? (
            <div className="empty">
              <h3>No stories published yet</h3>
              <p>Be the first to publish a story using the editor above.</p>
            </div>
          ) : (
            <div className="news-grid">
              {news.map(article => (
                <article className="news-card" key={article._id}>
                  {article.image ? (
                    <img className="news-image" src={article.image} alt={article.title}
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="image-placeholder">DP<span>.</span></div>
                  )}
                  <div className="card-body">
                    <span className="category">{article.category}</span>
                    <h3>{article.title}</h3>
                    <p className="excerpt">{article.content}</p>
                    <div className="card-meta">By {article.author}</div>
                    <div className="card-actions">
                      <button onClick={() => editArticle(article)}>Edit Article</button>
                      <button className="delete-btn" onClick={() => deleteArticle(article._id)}>Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <div className="brand"><span>DAILY</span>POST<span className="dot">.</span></div>
        <p>Independent stories. Informed perspectives.</p>
        <small>© {new Date().getFullYear()} DAILYPOST News Portal</small>
      </footer>
    </div>
  );
}

export default App;
