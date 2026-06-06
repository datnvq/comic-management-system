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
  
  const getImageUrl = (url: string) => {
    if (!url) return '';
    // If the url contains localhost, replace it with the dynamic apiHost (e.g. 127.0.0.1 or system IP)
    if (url.includes('localhost')) {
      return url.replace('localhost', apiHost);
    }
    return url;
  };

  const [view, setView] = useState<'public' | 'login' | 'admin'>(
    localStorage.getItem('token') ? 'admin' : 'public'
  );
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

  const handleGenreClick = async (genre: string) => {
    setKeyword(genre);
    try {
      setLoading(true);
      const url = `http://${apiHost}:3000/api/search?keyword=${encodeURIComponent(genre)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setComics(data);
      } else {
        setComics([]);
      }
    } catch (error) {
      console.error('Error filtering by genre:', error);
      setComics([]);
    } finally {
      setLoading(false);
    }
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
    setSelectedChapter(null); // Reset selected chapter preview
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
        <div className="nav-brand" onClick={() => {
          setView('public');
          setSelectedComic(null);
          setSelectedChapter(null);
        }}>
          <span className="brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </span>
          <span className="brand-title">CMS Comics</span>
        </div>
        <nav className="nav-links">
          <button 
            className={`nav-button ${view === 'public' ? 'active' : ''}`}
            onClick={() => {
              setView('public');
              setSelectedComic(null);
              setSelectedChapter(null);
            }}
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
              <span className="user-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Admin
              </span>
              <button className="nav-button logout-btn" onClick={handleLogout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
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
              <div className="input-group">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <input
                  type="email"
                  placeholder="Email tài khoản"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-group">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button className="login-submit-btn" onClick={handleLogin}>Đăng nhập</button>
              <button className="login-cancel-btn" onClick={() => setView('public')}>Quay lại Trang chủ</button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DEDICATED ADMIN DASHBOARD */}
      {view === 'admin' && token && (
        <div className="admin-container animate-fade-in-up">
          <div className="admin-header">
            <h1>Admin Panel</h1>
            <p className="subtitle">Hệ thống quản lý nội dung số nâng cao</p>
          </div>

          {/* STATE 1: Add Comic Form is shown */}
          {showAddComicForm ? (
            <div className="admin-box glass-panel-glow animate-scale-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Thêm tác phẩm truyện mới</h2>
                <button className="admin-back-btn" onClick={() => {
                  setShowAddComicForm(false);
                  setTitle('');
                  setAuthor('');
                  setGenres('');
                  setDescription('');
                  setCoverImage(null);
                }} style={{ margin: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                  Quay lại
                </button>
              </div>
              
              <div className="form-grid">
                <div className="form-field">
                  <label>Tên tác phẩm</label>
                  <input
                    type="text"
                    placeholder="Tên truyện (Title)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Tác giả</label>
                  <input
                    type="text"
                    placeholder="Tác giả (Author)"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label>Thể loại</label>
                  <input
                    type="text"
                    placeholder="Thể loại (Genres - cách nhau bởi dấu phẩy)"
                    value={genres}
                    onChange={(e) => setGenres(e.target.value)}
                  />
                  <span className="field-helper">Ví dụ: Hành động, Phiêu lưu, Fantasy</span>
                </div>
                <div className="form-field">
                  <label>Ảnh bìa truyện</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setCoverImage(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                {coverImage && (
                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <img
                      src={URL.createObjectURL(coverImage)}
                      alt="Preview"
                      className="preview-image"
                    />
                  </div>
                )}
                <div className="form-field">
                  <label>Mô tả tóm tắt</label>
                  <textarea
                    placeholder="Mô tả tóm tắt (Description)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="form-field">
                  <label>Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="ONGOING">ONGOING (Đang tiến hành)</option>
                    <option value="COMPLETED">COMPLETED (Đã hoàn thành)</option>
                  </select>
                </div>
              </div>
              <button className="login-submit-btn" style={{ marginTop: '15px' }} onClick={handleCreateComic}>Tạo Truyện Mới</button>
            </div>
          ) : selectedAdminComic ? (
            /* STATE 2: A Comic is selected to manage its chapters */
            <div className="admin-detail-layout glass-panel-glow animate-scale-in">
              {showAddChapterForm ? (
                /* STATE 2A: Dedicated Add Chapter form page */
                <div className="admin-box glass-panel animate-scale-in" style={{ maxWidth: '640px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Đăng tải chương mới</h3>
                    <button className="admin-back-btn" onClick={() => {
                      setShowAddChapterForm(false);
                      setChapterTitle('');
                      setChapterImages([]);
                    }} style={{ margin: 0 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      Quay lại mục lục
                    </button>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
                    Tác phẩm: <strong>{selectedAdminComic.title}</strong>
                  </p>
                  
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Tiêu đề chương</label>
                      <input
                        type="text"
                        placeholder="Tiêu đề Chapter (Chapter Title)"
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                      />
                    </div>
                    <div className="form-field">
                      <label>Số thứ tự chương</label>
                      <input
                        type="number"
                        placeholder="Số thứ tự Chapter"
                        value={chapterNumber}
                        onChange={(e) => setChapterNumber(Number(e.target.value))}
                      />
                    </div>
                    <div className="form-field">
                      <label>Hình ảnh chương (Chọn nhiều ảnh)</label>
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
                    </div>
                  </div>

                  {chapterImages.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Xem trước ảnh ({chapterImages.length})
                      </label>
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
                    </div>
                  )}
                  <button className="login-submit-btn" style={{ marginTop: '15px' }} onClick={handleCreateChapter}>Tạo Chapter mới</button>
                </div>
              ) : (
                /* STATE 2B: Chapter list & Comic details */
                <div className="animate-fade-in-up">
                  <div className="admin-detail-header">
                    <button className="admin-back-btn" onClick={() => setSelectedAdminComic(null)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      Quay lại danh sách truyện
                    </button>
                    <div className="admin-detail-comic-info">
                      <img
                        src={getImageUrl(selectedAdminComic.coverImage) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'}
                        alt={selectedAdminComic.title}
                        className="admin-detail-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
                        }}
                      />
                      <div className="admin-detail-meta">
                        <h2>{selectedAdminComic.title}</h2>
                        <p><strong>Tác giả:</strong> {selectedAdminComic.author}</p>
                        <p><strong>Thể loại:</strong> {Array.isArray(selectedAdminComic.genres) ? selectedAdminComic.genres.join(', ') : ''}</p>
                        <p style={{ marginTop: '8px' }}>
                          <span className={`badge ${selectedAdminComic.status === 'COMPLETED' ? 'badge-completed' : 'badge-ongoing'}`}>
                            {selectedAdminComic.status}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <div className="admin-box glass-panel" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '14px' }}>
                        <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>
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
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                          Đăng chapter mới
                        </button>
                      </div>
                      
                      <div className="admin-chapter-list">
                        {Array.isArray(chapters) && chapters.length > 0 ? (
                          chapters.map((chapter) => (
                            <div 
                              key={chapter._id} 
                              className={`admin-chapter-item glass-panel ${selectedChapter?._id === chapter._id ? 'active-chapter' : ''}`}
                              onClick={() => {
                                if (selectedChapter?._id === chapter._id) {
                                  setSelectedChapter(null);
                                } else {
                                  setSelectedChapter(chapter);
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <div>
                                <strong style={{ color: 'var(--text-primary)' }}>Chương {chapter.chapterNumber}</strong>: <span style={{ color: 'var(--text-secondary)' }}>{chapter.title}</span>
                                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>ID: {chapter._id} (Ấn để xem chương)</span>
                              </div>
                              <button
                                className="delete-chapter-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChapter(chapter._id);
                                }}
                                title="Xóa chương"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                                Xóa
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="no-chapters-message">
                            Tác phẩm này chưa được đăng tải chương nào.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chapter Preview for Admin */}
                    {selectedChapter && (
                      <div className="admin-chapter-preview reader-box animate-fade-in-up" style={{ marginTop: '24px' }}>
                        <div className="reader-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#0d0d14', borderBottom: '1px solid var(--border-light)' }}>
                          <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>
                            Xem trước Chương {selectedChapter.chapterNumber}: {selectedChapter.title}
                          </h2>
                          <button 
                            className="admin-back-btn" 
                            onClick={() => setSelectedChapter(null)}
                            style={{ margin: 0, padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Đóng xem trước
                          </button>
                        </div>
                        <div className="reader-images-container">
                          {Array.isArray(selectedChapter.images) && selectedChapter.images.length > 0 ? (
                            selectedChapter.images.map((image, index) => (
                              <div key={index} className="reader-image-wrapper">
                                <img
                                  src={getImageUrl(image)}
                                  alt={`Trang ${index + 1}`}
                                  className="reader-image"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
                                  }}
                                />
                                <span className="page-number">{index + 1} / {selectedChapter.images.length}</span>
                              </div>
                            ))
                          ) : (
                            <p style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>
                              Nội dung chương đang được chuẩn bị.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STATE 3: Display list of all comics to the Admin */
            <div className="animate-fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Danh sách tác phẩm ({comics.length})</h2>
                <button
                  className="add-comic-trigger"
                  onClick={() => setShowAddComicForm(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Thêm truyện mới
                </button>
              </div>

              {comics.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }} className="glass-panel">
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
                        src={getImageUrl(comic.coverImage) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'}
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
          {/* Immersive Welcome Banner */}
          {!selectedComic && (
            <div className="hero-banner glass-panel-glow">
              <div className="hero-content">
                <div className="hero-badge-container animate-fade-in">
                  <span className="hero-badge-dot"></span>
                  <span className="hero-badge-text">Chào mừng bạn đến với Cổng Truyện Tranh</span>
                </div>
                <h1>Nơi Cảm Xúc Thăng Hoa</h1>
                <p className="hero-subtitle">
                  Khám phá thế giới truyện tranh đầy sắc màu. Trải nghiệm giao diện mượt mà, hình ảnh chất lượng cao và cập nhật liên tục mỗi ngày!
                </p>
                
                <div className="hero-features">
                  <div className="hero-feature-item">
                    <div className="feature-icon-wrapper orange">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="feature-icon">
                        <path d="M13 2L3 14h9l-1 8 10-10h-9l1-8z"></path>
                      </svg>
                    </div>
                    <div className="feature-text">
                      <h4>Cập nhật nhanh</h4>
                      <p>Chương mới mỗi ngày</p>
                    </div>
                  </div>
                  
                  <div className="hero-feature-item">
                    <div className="feature-icon-wrapper emerald">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="feature-icon">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                    </div>
                    <div className="feature-text">
                      <h4>Ảnh chất lượng</h4>
                      <p>Trải nghiệm chuẩn HD</p>
                    </div>
                  </div>
                  
                  <div className="hero-feature-item">
                    <div className="feature-icon-wrapper rose">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="feature-icon">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </div>
                    <div className="feature-text">
                      <h4>Đọc miễn phí</h4>
                      <p>Không giới hạn chương</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="hero-illustration">
                <div className="manga-panel p1">
                  <div className="manga-panel-content">
                    <span className="emoji">📚</span>
                    <span className="comic-lines"></span>
                  </div>
                </div>
                <div className="manga-panel p2">
                  <div className="manga-panel-content">
                    <span className="emoji">🌟</span>
                    <span className="comic-lines"></span>
                  </div>
                </div>
                <div className="manga-bubble animate-float">
                  <span>Xem ngay! 💬</span>
                </div>
                <div className="floating-star s1">✦</div>
                <div className="floating-star s2">✦</div>
              </div>
            </div>
          )}

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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Quay lại
              </button>

              <div className="comic-detail-wrapper">
                <div className="comic-detail-left">
                  <img
                    className="detail-cover"
                    src={getImageUrl(selectedComic.coverImage) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'}
                    alt={selectedComic.title}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
                    }}
                  />
                </div>
                <div className="comic-detail-right">
                  <div className="comic-detail-header-info">
                    <span className={`badge ${selectedComic.status === 'COMPLETED' ? 'badge-completed' : 'badge-ongoing'}`}>
                      {selectedComic.status}
                    </span>
                    <h2>{selectedComic.title}</h2>
                    <p className="detail-meta-item">
                      <span className="meta-label">Tác giả:</span>
                      <span className="meta-value">{selectedComic.author}</span>
                    </p>
                    <div className="detail-genres-list">
                      {Array.isArray(selectedComic.genres) && selectedComic.genres.map((genre, idx) => (
                        <span key={idx} className="genre-tag">{genre}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="detail-desc-section">
                    <h3>Giới thiệu</h3>
                    <p className="desc">{selectedComic.description}</p>
                  </div>
                </div>
              </div>

              <div className="chapter-list-section">
                <h3>Danh sách chương</h3>
                <div className="chapter-list">
                  {Array.isArray(chapters) && chapters.length > 0 ? (
                    chapters.map((chapter) => (
                      <button
                        key={chapter._id}
                        onClick={() => handleSelectChapter(chapter)}
                        className={selectedChapter?._id === chapter._id ? 'active-chapter' : ''}
                      >
                        Chương {chapter.chapterNumber}: {chapter.title}
                      </button>
                    ))
                  ) : (
                    <div className="no-chapters-message">
                      Chưa có chương nào được đăng tải cho tác phẩm này.
                    </div>
                  )}
                </div>
              </div>

              {/* Immersive Reader scroll section */}
              {selectedChapter && (
                <div className="reader-box animate-fade-in-up">
                  <div className="reader-header">
                    <h2>
                      Đọc Chương {selectedChapter.chapterNumber}: {selectedChapter.title}
                    </h2>
                    <p className="reader-tip">Cuộn xuống để đọc tiếp chương truyện</p>
                  </div>
                  <div className="reader-images-container">
                    {Array.isArray(selectedChapter.images) && selectedChapter.images.length > 0 ? (
                      selectedChapter.images.map((image, index) => (
                        <div key={index} className="reader-image-wrapper">
                          <img
                            src={getImageUrl(image)}
                            alt={`Trang ${index + 1}`}
                            className="reader-image"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
                            }}
                          />
                          <span className="page-number">{index + 1} / {selectedChapter.images.length}</span>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>
                        Nội dung chương đang được chuẩn bị.
                      </p>
                    )}
                  </div>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
                <button onClick={handleSearch}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  Tìm Kiếm
                </button>
              </div>

              {/* Main Widescreen Layout Split */}
              <div className="public-main-layout">
                {/* Left side: Main catalog content */}
                <div className="public-catalog-container">
                  {/* Loader */}
                  {loading && (
                    <div className="loading-indicator">
                      <span>Đang tải danh sách truyện tranh...</span>
                    </div>
                  )}

                  {/* Empty catalog alert */}
                  {!loading && (!Array.isArray(comics) || comics.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }} className="glass-panel">
                      <p>Không tìm thấy tác phẩm truyện tranh nào phù hợp.</p>
                    </div>
                  )}

                  {/* Catalog Grid */}
                  {!loading && Array.isArray(comics) && comics.length > 0 && (
                    <div className="comic-grid">
                      {comics.map((comic) => (
                        <div
                          className="comic-card animate-fade-in"
                          key={comic._id}
                          onClick={() => handleSelectComic(comic)}
                        >
                          <img
                            src={getImageUrl(comic.coverImage) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'}
                            alt={comic.title}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
                            }}
                          />
                          <div className="comic-content">
                            <h2>{comic.title}</h2>
                            <div className="comic-genres-tags">
                              {Array.isArray(comic.genres) && comic.genres.slice(0, 3).map((genre, idx) => (
                                <span key={idx} className="genre-tag">{genre}</span>
                              ))}
                            </div>
                            <p>
                              <strong>Tác giả:</strong> {comic.author}
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

                {/* Right side: Sidebar (Featured & Hot Genres) */}
                <aside className="public-sidebar">
                  {/* Top Comics Ranking */}
                  {!loading && Array.isArray(comics) && comics.length > 0 && (
                    <div className="sidebar-widget glass-panel-glow">
                      <h3 className="widget-title">
                        <span className="title-icon">🔥</span>
                        Truyện Nổi Bật
                      </h3>
                      <div className="widget-content animate-fade-in">
                        {comics.slice(0, 5).map((comic, index) => (
                          <div 
                            key={comic._id} 
                            className="sidebar-comic-item"
                            onClick={() => handleSelectComic(comic)}
                          >
                            <div className={`ranking-badge rank-${index + 1}`}>
                              {index + 1}
                            </div>
                            <img 
                              src={getImageUrl(comic.coverImage) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60'} 
                              alt={comic.title} 
                              className="sidebar-comic-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60';
                              }}
                            />
                            <div className="sidebar-comic-info">
                              <h4>{comic.title}</h4>
                              <p>{comic.author}</p>
                              <span className={`badge-mini ${comic.status === 'COMPLETED' ? 'completed' : 'ongoing'}`}>
                                {comic.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hot Genres filter */}
                  <div className="sidebar-widget glass-panel-glow">
                    <h3 className="widget-title">
                      <span className="title-icon">🏷️</span>
                      Thể Loại Phổ Biến
                    </h3>
                    <div className="sidebar-genres">
                      {['Hành động', 'Hài hước', 'Drama', 'Kỳ ảo', 'Tình cảm', 'Phiêu lưu', 'Đời thường'].map((genre) => (
                        <button 
                          key={genre} 
                          className={`sidebar-genre-tag ${keyword === genre ? 'active' : ''}`}
                          onClick={() => handleGenreClick(genre)}
                        >
                          {genre}
                        </button>
                      ))}
                      {keyword && (
                        <button 
                          className="sidebar-genre-tag clear-filter"
                          onClick={() => {
                            setKeyword('');
                            setTimeout(() => {
                              fetchComics();
                            }, 50);
                          }}
                        >
                          Xóa bộ lọc ✕
                        </button>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;