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
  const apiHost = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
  const [view, setView] = useState<'public' | 'login' | 'admin'>('public');
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

  // Advanced Admin Panel state hooks
  const [selectedAdminComic, setSelectedAdminComic] = useState<Comic | null>(null);
  const [showAddComicForm, setShowAddComicForm] = useState(false);
  const [showAddChapterForm, setShowAddChapterForm] = useState(false);

  const fetchComics = async () => {
    try {
      setLoading(true);

      const url = keyword
        ? `http://${apiHost}:3000/api/search?keyword=${encodeURIComponent(keyword)}`
        : `http://${apiHost}:3000/api/comics`;

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
        `http://${apiHost}:3000/api/auth/login`,
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
        setEmail('');
        setPassword('');
        setView('admin'); // Redirect automatically to the dedicated Admin Panel
        setSelectedAdminComic(null);
        setShowAddComicForm(false);
        setShowAddChapterForm(false);
        alert('Đăng nhập thành công!');
      } else {
        alert(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi đăng nhập');
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
        `http://${apiHost}:3000/api/comics`,
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
        alert('Tạo tác phẩm truyện tranh thành công!');
        setTitle('');
        setAuthor('');
        setGenres('');
        setDescription('');
        setCoverImage(null);
        setStatus('ONGOING');
        fetchComics();
        setShowAddComicForm(false); // Hide create form
      } else {
        alert(data.message || 'Tạo thất bại');
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi tạo truyện');
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
        `http://${apiHost}:3000/api/chapters`,
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
        alert('Tạo Chapter thành công!');
        setChapterTitle('');
        setChapterNumber(chapterNumber + 1); // Helper to auto-increment next chap number
        setChapterImages([]);
        setShowAddChapterForm(false); // Hide form and return to chapter list
        if (selectedAdminComic) {
          await fetchChapters(selectedAdminComic._id);
        }
      } else {
        alert(data.message || 'Tạo thất bại');
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi tạo chapter');
    }
  };

  const fetchChapters = async (comicId: string) => {
    try {
      const response = await fetch(
        `http://${apiHost}:3000/api/chapters/comic/${comicId}`,
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

  const handleSelectAdminComic = async (comic: Comic) => {
    setSelectedAdminComic(comic);
    setChapterComicId(comic._id);
    setChapterTitle('');
    setChapterNumber(1);
    setChapterImages([]);
    setShowAddChapterForm(false); // Reset add chapter state
    await fetchChapters(comic._id);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này không?')) {
      return;
    }
    try {
      const response = await fetch(
        `http://${apiHost}:3000/api/chapters/${chapterId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        alert('Xóa chương thành công!');
        if (selectedAdminComic) {
          await fetchChapters(selectedAdminComic._id);
        }
      } else {
        alert(data.message || 'Xóa thất bại');
      }
    } catch (error) {
      console.error(error);
      alert('Đã xảy ra lỗi khi xóa chương');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setSelectedAdminComic(null);
    setShowAddComicForm(false);
    setShowAddChapterForm(false);
    setView('public'); // Reset to public view on logout
    alert('Đã đăng xuất thành công!');
  };

  return (
    <div className="app">
      {/* Sleek Top Navigation Header */}
      <header className="nav-header glass-panel">
        <div className="nav-brand" onClick={() => setView('public')}>
          <span className="brand-logo">📚</span>
          <span className="brand-title">CMS Comics</span>
        </div>
        <nav className="nav-links">
          <button 
            className={`nav-button ${view === 'public' ? 'active' : ''}`}
            onClick={() => setView('public')}
          >
            Trang chủ
          </button>
          
          {token && (
            <button 
              className={`nav-button ${view === 'admin' ? 'active' : ''}`}
              onClick={() => setView('admin')}
            >
              Quản trị Admin
            </button>
          )}
          
          {!token ? (
            <button 
              className={`nav-button login-btn ${view === 'login' ? 'active' : ''}`}
              onClick={() => setView('login')}
            >
              Đăng nhập
            </button>
          ) : (
            <div className="nav-user">
              <span className="user-badge">Admin</span>
              <button className="nav-button logout-btn" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* VIEW 1: DEDICATED LOGIN SCREEN */}
      {view === 'login' && (
        <div className="login-container animate-fade-in-up">
          <div className="login-card glass-panel-glow">
            <h2>Hệ thống Quản trị</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', textAlign: 'center' }}>
              Đăng nhập tài khoản của bạn để quản trị hệ thống
            </p>
            <div className="login-form">
              <input
                type="email"
                placeholder="Email tài khoản"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="login-submit-btn" onClick={handleLogin}>Đăng nhập</button>
              <button className="login-cancel-btn" onClick={() => setView('public')}>Quay lại Trang chủ</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DEDICATED ADMIN DASHBOARD */}
      {view === 'admin' && token && (
        <div className="admin-container animate-fade-in-up">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1>Admin Panel</h1>
            <p className="subtitle">Hệ thống quản lý nội dung số nâng cao</p>
          </div>

          {/* STATE 1: Add Comic Form is shown */}
          {showAddComicForm ? (
            <div className="admin-box glass-panel-glow animate-scale-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Thêm tác phẩm truyện mới</h2>
                <button className="admin-back-btn" onClick={() => {
                  setShowAddComicForm(false);
                  setTitle('');
                  setAuthor('');
                  setGenres('');
                  setDescription('');
                  setCoverImage(null);
                }} style={{ margin: 0, padding: '6px 12px', fontSize: '0.85rem' }}>
                  ← Quay lại
                </button>
              </div>
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
              <button className="login-submit-btn" style={{ marginTop: '15px' }} onClick={handleCreateComic}>Tạo Truyện Mới</button>
            </div>
          ) : selectedAdminComic ? (
            /* STATE 2: A Comic is selected to manage its chapters */
            <div className="admin-detail-layout glass-panel-glow animate-scale-in">
              {showAddChapterForm ? (
                /* STATE 2A: Dedicated Add Chapter form page */
                <div className="admin-box glass-panel animate-scale-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Đăng tải chương mới</h3>
                    <button className="admin-back-btn" onClick={() => {
                      setShowAddChapterForm(false);
                      setChapterTitle('');
                      setChapterImages([]);
                    }} style={{ margin: 0 }}>
                      ← Quay lại mục lục
                    </button>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
                    Tác phẩm: <strong>{selectedAdminComic.title}</strong>
                  </p>
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
                    <div className="preview-grid" style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
                  <button className="login-submit-btn" style={{ marginTop: '15px' }} onClick={handleCreateChapter}>Tạo Chapter mới</button>
                </div>
              ) : (
                /* STATE 2B: Chapter list & Comic details */
                <div className="animate-fade-in-up">
                  <div className="admin-detail-header">
                    <button className="admin-back-btn" onClick={() => setSelectedAdminComic(null)}>
                      ← Quay lại danh sách truyện
                    </button>
                    <div className="admin-detail-comic-info">
                      <img
                        src={selectedAdminComic.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'}
                        alt={selectedAdminComic.title}
                        className="admin-detail-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div>
                        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '8px' }}>{selectedAdminComic.title}</h2>
                        <p><strong>Tác giả:</strong> {selectedAdminComic.author}</p>
                        <p><strong>Thể loại:</strong> {Array.isArray(selectedAdminComic.genres) ? selectedAdminComic.genres.join(', ') : ''}</p>
                        <p style={{ marginTop: '5px' }}>
                          <span className={`badge ${selectedAdminComic.status === 'COMPLETED' ? 'badge-completed' : 'badge-ongoing'}`}>
                            {selectedAdminComic.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <div className="admin-box glass-panel">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                        <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                          Danh sách chương ({chapters.length})
                        </h3>
                        <button
                          className="add-comic-trigger"
                          onClick={() => {
                            if (chapters.length > 0) {
                              const maxChapterNum = Math.max(...chapters.map(c => c.chapterNumber));
                              setChapterNumber(maxChapterNum + 1);
                            } else {
                              setChapterNumber(1);
                            }
                            setShowAddChapterForm(true);
                          }}
                          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        >
                          ➕ Đăng chapter mới
                        </button>
                      </div>
                      
                      <div className="admin-chapter-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        {Array.isArray(chapters) && chapters.length > 0 ? (
                          chapters.map((chapter) => (
                            <div key={chapter._id} className="admin-chapter-item glass-panel">
                              <div>
                                <strong>Chương {chapter.chapterNumber}</strong>: {chapter.title}
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {chapter._id}</span>
                              </div>
                              <button
                                className="delete-chapter-btn"
                                onClick={() => handleDeleteChapter(chapter._id)}
                                title="Xóa chương"
                              >
                                🗑️ Xóa
                              </button>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>
                            Tác phẩm này chưa được đăng tải chương nào.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STATE 3: Display list of all comics to the Admin */
            <div className="animate-fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Danh sách tác phẩm ({comics.length})</h2>
                <button
                  className="add-comic-trigger"
                  onClick={() => setShowAddComicForm(true)}
                >
                  ➕ Thêm truyện mới
                </button>
              </div>

              {comics.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }} className="glass-panel">
                  Chưa có truyện nào trong hệ thống. Hãy bấm nút phía trên để thêm mới!
                </div>
              ) : (
                <div className="admin-comic-grid">
                  {comics.map((comic) => (
                    <div
                      key={comic._id}
                      className="admin-comic-card glass-panel animate-fade-in"
                      onClick={() => handleSelectAdminComic(comic)}
                    >
                      <img
                        src={comic.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'}
                        alt={comic.title}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div className="admin-comic-content">
                        <h3>{comic.title}</h3>
                        <p><strong>Tác giả:</strong> {comic.author}</p>
                        <p style={{ marginTop: '5px' }}>
                          <span className={`badge ${comic.status === 'COMPLETED' ? 'badge-completed' : 'badge-ongoing'}`}>
                            {comic.status}
                          </span>
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', wordBreak: 'break-all' }}>
                          <strong>ID:</strong> {comic._id}
                        </p>
                        <div className="admin-card-action">
                          Quản lý chương →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: PUBLIC READER VIEW */}
      {view === 'public' && (
        <div className="public-container animate-fade-in-up">
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h1>Comic Management System</h1>
            <p className="subtitle">Distributed System Comic Platform</p>
          </div>

          {/* Detailed Comic Info Page */}
          {selectedComic ? (
            <div className="detail-box glass-panel-glow animate-scale-in">
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

              {/* Immersive Reader scroll section */}
              {selectedChapter && (
                <div className="reader-box animate-fade-in-up">
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
          ) : (
            <>
              {/* Search Bar */}
              <div className="search-box glass-panel">
                <input
                  type="text"
                  placeholder="Tìm truyện, tác giả, thể loại..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
                <button onClick={handleSearch}>Tìm Kiếm</button>
              </div>

              {/* Loader */}
              {loading && (
                <div className="loading-indicator">
                  <span>Đang tải danh sách truyện tranh...</span>
                </div>
              )}

              {/* Empty catalog alert */}
              {!loading && (!Array.isArray(comics) || comics.length === 0) && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <p>Không tìm thấy tác phẩm truyện tranh nào phù hợp.</p>
                </div>
              )}

              {/* Catalog Grid */}
              {!loading && Array.isArray(comics) && comics.length > 0 && (
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;