import { useEffect, useState } from 'react';
import './App.css';

type Comic = {
  _id: string;
  title: string;
  author: string;
  genres: string[];
  description: string;
  coverImage: string;
  status: string;
};

type Chapter = {
  _id: string;
  comicId: string;
  title: string;
  chapterNumber: number;
  images: string[];
};

function App() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [token, setToken] = useState(
    localStorage.getItem('token') || '',
  );
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genres, setGenres] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [status, setStatus] = useState('ONGOING');
  
  const [chapterComicId, setChapterComicId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterImages, setChapterImages] = useState<File[]>([]);

  const [selectedComic, setSelectedComic] = useState<Comic | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const fetchComics = async () => {
    try {
      setLoading(true);

      const url = keyword
        ? `http://localhost:3000/api/search?keyword=${encodeURIComponent(keyword)}`
        : 'http://localhost:3000/api/comics';

      const response = await fetch(url);
      const data = await response.json();

      // Robust check to prevent crashes on error/HTML responses
      if (Array.isArray(data)) {
        setComics(data);
        if (data.length > 0 && !chapterComicId) {
          setChapterComicId(data[0]._id);
        }
      } else {
        console.error('Data returned is not an array:', data);
        setComics([]);
      }
    } catch (error) {
      console.error('Error fetching comics:', error);
      setComics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComics();
  }, []);

  const handleSearch = () => {
    fetchComics();
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(
        'http://localhost:3000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
        setToken(data.accessToken);
        alert('Login successful!');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error(error);
      alert('Login error occurred');
    }
  };

  const handleCreateComic = async () => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('author', author);

      genres
        .split(',')
        .map((g) => g.trim())
        .forEach((genre) => {
          formData.append('genres', genre);
        });

      formData.append('description', description);
      formData.append('status', status);

      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      const response = await fetch(
        'http://localhost:3000/api/comics',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert('Comic created successfully!');
        setTitle('');
        setAuthor('');
        setGenres('');
        setDescription('');
        setCoverImage(null);
        setStatus('ONGOING');
        fetchComics();
      } else {
        alert(data.message || 'Creation failed');
      }
    } catch (error) {
      console.error(error);
      alert('Create comic error occurred');
    }
  };

  const handleCreateChapter = async () => {
    try {
      const formData = new FormData();
      formData.append('comicId', chapterComicId);
      formData.append('title', chapterTitle);
      formData.append('chapterNumber', chapterNumber.toString());

      chapterImages.forEach((image) => {
        formData.append('images', image);
      });

      const response = await fetch(
        'http://localhost:3000/api/chapters',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        alert('Chapter created successfully!');
        setChapterComicId('');
        setChapterTitle('');
        setChapterNumber(1);
        setChapterImages([]);
      } else {
        alert(data.message || 'Creation failed');
      }
    } catch (error) {
      console.error(error);
      alert('Create chapter error occurred');
    }
  };

  const fetchChapters = async (comicId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/chapters/comic/${comicId}`,
      );
      const data = await response.json();

      // Robust check to avoid crashes if Chapters API responds with error
      if (Array.isArray(data)) {
        setChapters(data);
      } else {
        console.error('Chapters data is not an array:', data);
        setChapters([]);
      }
    } catch (error) {
      console.error(error);
      setChapters([]);
    }
  };

  const handleSelectComic = async (comic: Comic) => {
    setSelectedComic(comic);
    setSelectedChapter(null);
    await fetchChapters(comic._id);
  };

  const handleSelectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  return (
    <div className="app">
      <h1>Comic Management System</h1>
      <p className="subtitle">Distributed System Comic Platform</p>

      {/* Auth Section */}
      <div className="auth-box glass-panel">
        {!token ? (
          <>
            <input
              type="email"
              placeholder="Email (Admin / User)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
          </>
        ) : (
          <div className="logged-in">
            <span>Đã đăng nhập thành công</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>

      {/* Admin Panel - Add Comic */}
      {token && (
        <div className="admin-box glass-panel">
          <h2>Admin - Thêm truyện mới</h2>
          <input
            type="text"
            placeholder="Tên truyện (Title)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tác giả (Author)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <input
            type="text"
            placeholder="Thể loại (Genres - cách nhau bởi dấu phẩy)"
            value={genres}
            onChange={(e) => setGenres(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setCoverImage(e.target.files[0]);
              }
            }}
          />
          {coverImage && (
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <img
                src={URL.createObjectURL(coverImage)}
                alt="Preview"
                className="preview-image"
              />
            </div>
          )}
          <textarea
            placeholder="Mô tả tóm tắt (Description)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
          <button onClick={handleCreateComic}>Tạo Truyện Mới</button>
        </div>
      )}

      {/* Admin Panel - Add Chapter */}
      {token && (
        <div className="admin-box glass-panel">
          <h2>Admin - Thêm Chapter</h2>
          <select
            value={chapterComicId}
            onChange={(e) => setChapterComicId(e.target.value)}
          >
            <option value="">-- Chọn truyện tranh --</option>
            {comics.map((comic) => (
              <option key={comic._id} value={comic._id}>
                {comic.title} ({comic._id.substring(0, 6)}...)
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Tiêu đề Chapter (Chapter Title)"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
          />
          <input
            type="number"
            placeholder="Số thứ tự Chapter"
            value={chapterNumber}
            onChange={(e) => setChapterNumber(Number(e.target.value))}
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) {
                setChapterImages(Array.from(e.target.files));
              }
            }}
          />
          {chapterImages.length > 0 && (
            <div className="preview-grid">
              {chapterImages.map((image, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index}`}
                  className="preview-image"
                />
              ))}
            </div>
          )}
          <button onClick={handleCreateChapter}>Tạo Chapter</button>
        </div>
      )}

      {/* Search Section */}
      <div className="search-box glass-panel">
        <input
          type="text"
          placeholder="Tìm truyện, tác giả, thể loại..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button onClick={handleSearch}>Tìm Kiếm</button>
      </div>

      {/* Loader indicator */}
      {loading && (
        <div className="loading-indicator">
          <span>Đang tải danh sách truyện tranh...</span>
        </div>
      )}

      {/* Error or Empty state */}
      {!loading && (!Array.isArray(comics) || comics.length === 0) && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <p>Không tìm thấy tác phẩm truyện tranh nào phù hợp.</p>
        </div>
      )}

      {/* Detailed Comic View */}
      {selectedComic && (
        <div className="detail-box glass-panel-glow">
          <button
            className="back-button"
            onClick={() => {
              setSelectedComic(null);
              setSelectedChapter(null);
            }}
          >
            ← Quay lại
          </button>

          <h2>{selectedComic.title}</h2>
          
          <img
            className="detail-cover"
            src={selectedComic.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'}
            alt={selectedComic.title}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
            }}
          />

          <p>
            <strong>Tác giả:</strong> {selectedComic.author}
          </p>
          <p>
            <strong>Thể loại:</strong> {Array.isArray(selectedComic.genres) ? selectedComic.genres.join(', ') : ''}
          </p>
          <p style={{ margin: '15px 0' }}>
            <span className={`badge ${selectedComic.status === 'COMPLETED' ? 'badge-completed' : 'badge-ongoing'}`}>
              {selectedComic.status}
            </span>
          </p>
          <p className="desc">{selectedComic.description}</p>

          <h3 style={{ marginTop: '30px', fontSize: '1.4rem', borderBottom: '2px solid rgba(255,255,255,0.05)', width: '100%', paddingBottom: '10px', textAlign: 'center' }}>
            Mục lục chương
          </h3>

          <div className="chapter-list">
            {Array.isArray(chapters) && chapters.length > 0 ? (
              chapters.map((chapter) => (
                <button
                  key={chapter._id}
                  onClick={() => handleSelectChapter(chapter)}
                >
                  Chương {chapter.chapterNumber}: {chapter.title}
                </button>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
                Chưa có chương nào được đăng tải cho tác phẩm này.
              </div>
            )}
          </div>

          {/* Webtoon Reader Section */}
          {selectedChapter && (
            <div className="reader-box">
              <h2>
                Đọc Chương {selectedChapter.chapterNumber}: {selectedChapter.title}
              </h2>
              {Array.isArray(selectedChapter.images) && selectedChapter.images.length > 0 ? (
                selectedChapter.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Trang ${index + 1}`}
                    className="reader-image"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
                    }}
                  />
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>
                  Nội dung chương đang được chuẩn bị.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Grid View */}
      {!selectedComic && Array.isArray(comics) && comics.length > 0 && (
        <div className="comic-grid">
          {comics.map((comic) => (
            <div
              className="comic-card"
              key={comic._id}
              onClick={() => handleSelectComic(comic)}
            >
              <img
                src={comic.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'}
                alt={comic.title}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
                }}
              />
              <div className="comic-content">
                <h2>{comic.title}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', marginBottom: '8px', wordBreak: 'break-all' }}>
                  <strong>ID:</strong> {comic._id}
                </p>
                <p>
                  <strong>Tác giả:</strong> {comic.author}
                </p>
                <p>
                  <strong>Thể loại:</strong> {Array.isArray(comic.genres) ? comic.genres.join(', ') : ''}
                </p>
                <p style={{ marginTop: '6px' }}>
                  <span className={`badge ${comic.status === 'COMPLETED' ? 'badge-completed' : 'badge-ongoing'}`}>
                    {comic.status}
                  </span>
                </p>
                <p>{comic.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;