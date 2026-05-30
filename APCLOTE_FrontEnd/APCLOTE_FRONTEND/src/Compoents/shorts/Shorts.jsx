import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiLoader,
  FiMessageCircle,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiSend,
  FiUpload,
  FiVolume2,
  FiVolumeX,
  FiX,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import "./shorts.css";
import { BASE_URL as API_ORIGIN } from "../../config/api";

const COMMENTS_PAGE_SIZE = 8;

const createVideoState = () => ({
  currentTime: 0,
  duration: 0,
  buffered: 0,
  isMuted: true,
  isPaused: false,
  isLoading: true,
  hasError: false,
});

const safeParse = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const formatCount = (value = 0) => {
  if (value < 1000) {
    return `${value}`;
  }

  if (value < 1000000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }

  return `${(value / 1000000).toFixed(1)}M`;
};

const formatTime = (seconds = 0) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${`${secs}`.padStart(2, "0")}`;
};

const formatRelativeTime = (value) => {
  if (!value) {
    return "Just now";
  }

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return "Just now";
  }

  const diff = Date.now() - target.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)}m ago`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)}h ago`;
  }

  return `${Math.floor(diff / day)}d ago`;
};

const normalizeVideo = (video) => {
  const fallbackOrigin =
    typeof window !== "undefined" ? window.location.origin : API_ORIGIN;

  try {
    const url = new URL(video.videoUrl, fallbackOrigin);
    if (url.pathname.startsWith("/uploads/")) {
      const apiUrl = new URL(API_ORIGIN);
      url.protocol = apiUrl.protocol;
      url.host = apiUrl.host;
    }

    return { ...video, videoUrl: url.toString() };
  } catch {
    return { ...video };
  }
};

const getCommentAuthor = (comment, currentUser) => {
  if (currentUser?.id && currentUser.id === comment.userId) {
    return currentUser.name || "You";
  }

  return `User ${comment.userId}`;
};

const getAuthConfig = () => {
  const token = safeParse(localStorage.getItem("JWT"));

  if (!token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

function Shorts() {
  const { auth } = useSelector((store) => store);
  const currentUser = auth?.user || safeParse(localStorage.getItem("USER"));

  const videoRefs = useRef([]);
  const cardRefs = useRef([]);
  const feedRef = useRef(null);
  const lastTapRef = useRef({ index: -1, time: 0 });
  const videoStatesRef = useRef({});
  const activeIndexRef = useRef(0);
  const likeRequestsRef = useRef(new Set());

  const [videos, setVideos] = useState([]);
  const [videoStates, setVideoStates] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeHeart, setActiveHeart] = useState(null);

  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState("");

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState({ type: "", message: "" });

  const [commentsTarget, setCommentsTarget] = useState(null);

  const activeVideo = videos[activeIndex] || null;
  const activeVideoState = activeVideo ? videoStates[activeVideo.id] || createVideoState() : createVideoState();

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const patchVideoState = (videoId, patch) => {
    setVideoStates((prev) => {
      const currentState = prev[videoId] || createVideoState();
      const nextState = {
        ...currentState,
        ...patch,
      };

      const hasChanged = Object.keys(patch).some(
        (key) => currentState[key] !== nextState[key]
      );

      if (!hasChanged) {
        return prev;
      }

      const updated = {
        ...prev,
        [videoId]: nextState,
      };
      videoStatesRef.current = updated;
      return updated;
    });
  };

  const loadFeed = async () => {
    setFeedLoading(true);
    setFeedError("");

    try {
      const response = await axios.get(`${API_ORIGIN}/api/videos/feed`, getAuthConfig());
      const nextVideos = Array.isArray(response.data)
        ? response.data.map(normalizeVideo)
        : [];

      setVideos(nextVideos);
      setVideoStates((prev) =>
        nextVideos.reduce((acc, video) => {
          acc[video.id] = prev[video.id] || createVideoState();
          return acc;
        }, {})
      );
      videoStatesRef.current = nextVideos.reduce((acc, video) => {
        acc[video.id] = videoStatesRef.current[video.id] || createVideoState();
        return acc;
      }, {});
      setActiveIndex(0);
    } catch (error) {
      setFeedError("Unable to load reels right now.");
      toast.error(error.response?.data?.message || "Failed to load reels");
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    if (!videos.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let nextActiveIndex = activeIndexRef.current;
        let maxRatio = 0;

        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index);
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            nextActiveIndex = index;
            maxRatio = entry.intersectionRatio;
          }
        });

        if (maxRatio > 0.55) {
          setActiveIndex(nextActiveIndex);
        }
      },
      {
        root: feedRef.current,
        threshold: [0.4, 0.6, 0.8],
      }
    );

    cardRefs.current.forEach((card) => {
      if (card) {
        observer.observe(card);
      }
    });

    return () => observer.disconnect();
  }, [videos]);

  useEffect(() => {
    const activeElement = videoRefs.current[activeIndex];

    videoRefs.current.forEach((videoElement, index) => {
      if (!videoElement) {
        return;
      }

      const item = videos[index];
      if (!item) {
        return;
      }

      const state = videoStatesRef.current[item.id] || createVideoState();
      videoElement.muted = state.isMuted;

      if (index === activeIndex) {
        if (videoElement.paused) {
          const playPromise = videoElement.play();
          if (playPromise?.catch) {
            playPromise.catch(() => {
              patchVideoState(item.id, { isPaused: true });
            });
          }
        }
      } else {
        if (!videoElement.paused) {
          videoElement.pause();
        }
      }
    });

    return () => {
      if (activeElement && !activeElement.paused) {
        activeElement.pause();
      }
    };
  }, [activeIndex, videos]);

  const triggerHeart = (videoId) => {
    setActiveHeart(videoId);
    window.clearTimeout(triggerHeart.timeoutId);
    triggerHeart.timeoutId = window.setTimeout(() => {
      setActiveHeart(null);
    }, 650);
  };

  const togglePlayback = (index) => {
    const video = videos[index];
    const element = videoRefs.current[index];

    if (!video || !element) {
      return;
    }

    if (element.paused) {
      element.play().catch(() => undefined);
      patchVideoState(video.id, { isPaused: false });
      return;
    }

    element.pause();
    patchVideoState(video.id, { isPaused: true });
  };

  const handleVideoTap = (index, videoId) => {
    const now = Date.now();
    const isDoubleTap =
      lastTapRef.current.index === index && now - lastTapRef.current.time < 280;

    lastTapRef.current = { index, time: now };

    if (isDoubleTap) {
      handleLike(videoId, true);
      triggerHeart(videoId);
      return;
    }

    togglePlayback(index);
  };

  const handleLike = async (videoId, silent = false) => {
    if (likeRequestsRef.current.has(videoId)) {
      return;
    }

    likeRequestsRef.current.add(videoId);

    try {
      const response = await axios.post(
        `${API_ORIGIN}/api/videos/${videoId}/like`,
        {},
        getAuthConfig()
      );
      const likedNow = Boolean(response.data);

      setVideos((prev) =>
        prev.map((video) =>
          video.id === videoId
            ? {
                ...video,
                likesCount: Math.max(
                  0,
                  (video.likesCount || 0) + (likedNow ? 1 : -1)
                ),
              }
            : video
        )
      );

      if (!silent) {
        toast.success(likedNow ? "Reel liked" : "Like removed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update like");
    } finally {
      likeRequestsRef.current.delete(videoId);
    }
  };

  const handleShare = async (video) => {
    const shareUrl = `${window.location.origin}/shorts?video=${video.id}`;
    const shareData = {
      title: "APCLOTE Shorts",
      text: video.description || "Watch this reel on APCLOTE",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Reel link copied");
      } else {
        window.prompt("Copy this reel link", shareUrl);
      }
    } catch {
      toast.error("Share was cancelled");
    }
  };

  const handleMuteToggle = (index) => {
    const video = videos[index];
    const element = videoRefs.current[index];

    if (!video || !element) {
      return;
    }

    const nextMuted = !element.muted;
    element.muted = nextMuted;
    patchVideoState(video.id, { isMuted: nextMuted });
  };

  const seekToPoint = (event, index, videoId) => {
    const element = videoRefs.current[index];
    const state = videoStates[videoId] || createVideoState();

    if (!element || !state.duration) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    element.currentTime = ratio * state.duration;
    patchVideoState(videoId, { currentTime: element.currentTime });
  };

  const uploadVideo = async (file, description) => {
    if (!file) {
      setUploadStatus({ type: "error", message: "Choose a video before uploading." });
      return;
    }

    const payload = new FormData();
    payload.append("file", file);
    payload.append("desc", description.trim());

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus({ type: "", message: "" });

    try {
      const response = await axios.post(`${API_ORIGIN}/api/videos/upload`, payload, {
        ...getAuthConfig(),
        onUploadProgress: (event) => {
          if (!event.total) {
            return;
          }

          setUploadProgress(Math.round((event.loaded * 100) / event.total));
        },
      });

      const uploadedVideo = normalizeVideo(response.data);
      setVideos((prev) => [uploadedVideo, ...prev]);
      setVideoStates((prev) => ({
        [uploadedVideo.id]: createVideoState(),
        ...prev,
      }));
      setUploadStatus({ type: "success", message: "Reel uploaded successfully." });
      toast.success("Video uploaded successfully");
      setShowUpload(false);
    } catch (error) {
      const message = error.response?.data?.message || "Video upload failed.";
      setUploadStatus({ type: "error", message });
      toast.error(message);
    } finally {
      setUploading(false);
      window.setTimeout(() => setUploadProgress(0), 400);
    }
  };

  return (
    <div className="shorts-page">
      <aside className="shorts-sidebar">
        <div className="shorts-sidebar__panel">
          <span className="shorts-pill">APCLOTE Reels</span>
          <h1>Short-form learning, now with a reel-style experience.</h1>
          <p>
            The feed now uses a desktop-friendly reel stage, responsive mobile
            layout, upload flow, progress indicators, and latest comments in a
            dedicated panel.
          </p>

          <button
            type="button"
            className="shorts-primary-btn"
            onClick={() => {
              setUploadStatus({ type: "", message: "" });
              setShowUpload(true);
            }}
          >
            <FiUpload />
            Upload Reel
          </button>

          <div className="shorts-sidebar__stats">
            <div>
              <strong>{videos.length}</strong>
              <span>Reels in feed</span>
            </div>
            <div>
              <strong>{activeVideo ? formatCount(activeVideo.likesCount || 0) : 0}</strong>
              <span>Active likes</span>
            </div>
            <div>
              <strong>{currentUser?.name ? currentUser.name.split(" ")[0] : "Guest"}</strong>
              <span>Watching as</span>
            </div>
          </div>

          <div className="shorts-sidebar__note">
            <FiCheckCircle />
            <span>
              Global site body stays white now. Only the reel canvas uses the
              darker cinematic styling.
            </span>
          </div>
        </div>
      </aside>

      <section className="shorts-stage">
        {feedLoading ? (
          <div className="shorts-empty">
            <FiLoader className="spin" />
            <span>Loading reels...</span>
          </div>
        ) : feedError ? (
          <div className="shorts-empty">
            <FiAlertCircle />
            <span>{feedError}</span>
            <button type="button" className="shorts-secondary-btn" onClick={loadFeed}>
              <FiRefreshCw />
              Retry
            </button>
          </div>
        ) : !videos.length ? (
          <div className="shorts-empty">
            <FiUpload />
            <span>No reels yet. Upload the first one.</span>
            <button
              type="button"
              className="shorts-primary-btn"
              onClick={() => setShowUpload(true)}
            >
              <FiUpload />
              Create Reel
            </button>
          </div>
        ) : (
          <div className="shorts-feed" ref={feedRef}>
            {videos.map((video, index) => {
              const state = videoStates[video.id] || createVideoState();
              const progress = state.duration
                ? Math.min(100, (state.currentTime / state.duration) * 100)
                : 0;
              const isActive = index === activeIndex;

              return (
                <article
                  key={video.id}
                  className={`short-card ${isActive ? "is-active" : ""}`}
                  data-index={index}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                >
                  <div className="short-frame">
                    <div
                      className="short-video-shell"
                      onClick={() => handleVideoTap(index, video.id)}
                    >
                      <video
                        ref={(node) => {
                          videoRefs.current[index] = node;
                        }}
                        className="short-video"
                        src={video.videoUrl}
                        loop
                        playsInline
                        preload="metadata"
                        muted={state.isMuted}
                        onLoadedMetadata={(event) => {
                          const element = event.currentTarget;
                          patchVideoState(video.id, {
                            duration: element.duration || 0,
                            currentTime: element.currentTime || 0,
                            isLoading: false,
                          });
                        }}
                        onTimeUpdate={(event) => {
                          const element = event.currentTarget;
                          const previousState =
                            videoStatesRef.current[video.id] || createVideoState();
                          const nextTime = element.currentTime || 0;
                          const nextPaused = element.paused;

                          if (
                            Math.abs((previousState.currentTime || 0) - nextTime) < 0.25 &&
                            previousState.isPaused === nextPaused
                          ) {
                            return;
                          }

                          patchVideoState(video.id, {
                            currentTime: nextTime,
                            isPaused: nextPaused,
                          });
                        }}
                        onProgress={(event) => {
                          const element = event.currentTarget;
                          const duration = element.duration || 0;
                          const bufferedEnd =
                            duration && element.buffered.length
                              ? element.buffered.end(element.buffered.length - 1)
                              : 0;
                          const nextBuffered = duration ? (bufferedEnd / duration) * 100 : 0;
                          const previousBuffered =
                            videoStatesRef.current[video.id]?.buffered || 0;

                          if (Math.abs(previousBuffered - nextBuffered) < 1) {
                            return;
                          }

                          patchVideoState(video.id, {
                            buffered: nextBuffered,
                          });
                        }}
                        onWaiting={() => patchVideoState(video.id, { isLoading: true })}
                        onCanPlay={() => patchVideoState(video.id, { isLoading: false })}
                        onPause={() => patchVideoState(video.id, { isPaused: true })}
                        onPlay={() => patchVideoState(video.id, { isPaused: false })}
                        onError={() =>
                          patchVideoState(video.id, {
                            hasError: true,
                            isLoading: false,
                          })
                        }
                      />

                      <div className="short-video__glow" />

                      {activeHeart === video.id && (
                        <div className="short-heart-burst">
                          <FaHeart />
                        </div>
                      )}

                      {state.isLoading && !state.hasError && (
                        <div className="short-overlay-chip">
                          <FiLoader className="spin" />
                          Streaming reel...
                        </div>
                      )}

                      {state.hasError && (
                        <div className="short-overlay-chip short-overlay-chip--error">
                          <FiAlertCircle />
                          Video stream unavailable
                        </div>
                      )}

                      <div className="short-top-bar">
                        <span className="short-top-bar__label">Reels</span>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleMuteToggle(index);
                          }}
                          aria-label={state.isMuted ? "Unmute reel" : "Mute reel"}
                        >
                          {state.isMuted ? <FiVolumeX /> : <FiVolume2 />}
                        </button>
                      </div>

                      <div className="short-actions">
                        <button
                          type="button"
                          className="short-action-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleLike(video.id);
                          }}
                        >
                          <FaHeart />
                          <span>{formatCount(video.likesCount || 0)}</span>
                        </button>

                        <button
                          type="button"
                          className="short-action-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            setCommentsTarget(video);
                          }}
                        >
                          <FiMessageCircle />
                          <span>Comments</span>
                        </button>

                        <button
                          type="button"
                          className="short-action-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleShare(video);
                          }}
                        >
                          <FiSend />
                          <span>Share</span>
                        </button>
                      </div>

                      <div className="short-meta">
                        <div className="short-meta__user">
                          <div className="short-meta__avatar">
                            {(currentUser?.name || "A")[0].toUpperCase()}
                          </div>
                          <div>
                            <strong>{currentUser?.name || `Creator ${video.userId}`}</strong>
                            <span>{formatRelativeTime(video.createdAt)}</span>
                          </div>
                        </div>

                        <p>{video.description || "No caption added yet."}</p>

                        <div
                          className="short-progress"
                          role="button"
                          tabIndex={0}
                          onClick={(event) => seekToPoint(event, index, video.id)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              seekToPoint(event, index, video.id);
                            }
                          }}
                        >
                          <span
                            className="short-progress__buffer"
                            style={{ width: `${state.buffered}%` }}
                          />
                          <span
                            className="short-progress__played"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="short-meta__footer">
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={(event) => {
                              event.stopPropagation();
                              togglePlayback(index);
                            }}
                          >
                            {state.isPaused ? <FiPlay /> : <FiPause />}
                          </button>
                          <span>
                            {formatTime(state.currentTime)} / {formatTime(state.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <aside className="shorts-inspector">
        <div className="shorts-inspector__panel">
          <div className="shorts-inspector__header">
            <span>Now playing</span>
            <FiChevronDown />
          </div>

          {activeVideo ? (
            <>
              <h2>{activeVideo.description || "Untitled reel"}</h2>
              <div className="shorts-inspector__metrics">
                <div>
                  <span>Likes</span>
                  <strong>{formatCount(activeVideo.likesCount || 0)}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>
                    {activeVideoState.isPaused ? "Paused" : activeVideoState.isLoading ? "Buffering" : "Playing"}
                  </strong>
                </div>
              </div>

              <div className="shorts-inspector__card">
                <h3>Latest comments</h3>
                <p>
                  Open the comments panel to see the newest comments first and
                  post a reply.
                </p>
                <button
                  type="button"
                  className="shorts-secondary-btn"
                  onClick={() => setCommentsTarget(activeVideo)}
                >
                  <FiMessageCircle />
                  View comments
                </button>
              </div>

              <div className="shorts-inspector__card">
                <h3>Upload status</h3>
                <p>
                  {uploadStatus.message ||
                    "Your upload form now includes progress, validation, and success or error feedback."}
                </p>
                {uploadProgress > 0 && uploading && (
                  <div className="upload-progress">
                    <div style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="shorts-empty shorts-empty--compact">
              <span>Select a reel to inspect it here.</span>
            </div>
          )}
        </div>
      </aside>

      {showUpload && (
        <UploadModal
          onClose={() => {
            if (!uploading) {
              setShowUpload(false);
            }
          }}
          onUpload={uploadVideo}
          uploading={uploading}
          progress={uploadProgress}
          status={uploadStatus}
        />
      )}

      {commentsTarget && (
        <CommentsDrawer
          video={commentsTarget}
          currentUser={currentUser}
          onClose={() => setCommentsTarget(null)}
        />
      )}
    </div>
  );
}

function CommentsDrawer({ video, currentUser, onClose }) {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const loadComments = useCallback(async (pageNumber, append) => {
    const setLoader = append ? setLoadingMore : setLoading;
    setLoader(true);

    try {
      const response = await axios.get(
        `${API_ORIGIN}/api/videos/${video.id}/comments?page=${pageNumber}&size=${COMMENTS_PAGE_SIZE}`,
        getAuthConfig()
      );

      const nextComments = Array.isArray(response.data?.content)
        ? response.data.content
        : Array.isArray(response.data)
          ? response.data
          : [];

      setComments((prev) => {
        if (!append) {
          return nextComments;
        }

        const knownIds = new Set(prev.map((comment) => comment.id));
        return [...prev, ...nextComments.filter((comment) => !knownIds.has(comment.id))];
      });
      setHasMore(nextComments.length === COMMENTS_PAGE_SIZE);
      setStatus({ type: "", message: "" });
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to load latest comments.";
      setStatus({ type: "error", message });
    } finally {
      setLoader(false);
    }
  }, [video.id]);

  useEffect(() => {
    setComments([]);
    setPage(0);
    setHasMore(true);
    loadComments(0, false);
  }, [loadComments, video.id]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments(nextPage, true);
  };

  const handleSend = async () => {
    if (!text.trim()) {
      setStatus({ type: "error", message: "Write a comment before sending." });
      return;
    }

    setSending(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await axios.post(
        `${API_ORIGIN}/api/videos/${video.id}/comment`,
        {
          text: text.trim(),
        },
        getAuthConfig()
      );

      const createdComment = response.data || {
        id: Date.now(),
        text: text.trim(),
        userId: currentUser?.id || 0,
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [createdComment, ...prev]);
      setText("");
      setStatus({ type: "success", message: "Comment posted." });
    } catch (error) {
      const statusCode = error.response?.status;
      const message =
        statusCode === 404
          ? "Comment posting is not available from the backend yet."
          : error.response?.data?.message || "Unable to post comment.";
      setStatus({ type: "error", message });
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="comment-sheet-backdrop" onClick={onClose}>
      <aside
        className="comment-sheet"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="comment-sheet__header">
          <div>
            <span>Latest comments</span>
            <strong>{video.description || "Reel discussion"}</strong>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="comment-sheet__body">
          {loading ? (
            <div className="shorts-empty shorts-empty--compact">
              <FiLoader className="spin" />
              <span>Loading latest comments...</span>
            </div>
          ) : comments.length ? (
            <>
              <div className="comment-list">
                {comments.map((comment) => (
                  <article key={comment.id} className="comment-card">
                    <div className="comment-card__avatar">
                      {getCommentAuthor(comment, currentUser)[0].toUpperCase()}
                    </div>
                    <div className="comment-card__content">
                      <div className="comment-card__meta">
                        <strong>{getCommentAuthor(comment, currentUser)}</strong>
                        <span>{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  </article>
                ))}
              </div>

              {hasMore && (
                <button
                  type="button"
                  className="shorts-secondary-btn comment-load-more"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? <FiLoader className="spin" /> : <FiChevronDown />}
                  {loadingMore ? "Loading..." : "Load older comments"}
                </button>
              )}
            </>
          ) : (
            <div className="shorts-empty shorts-empty--compact">
              <FiMessageCircle />
              <span>No comments yet. Start the conversation.</span>
            </div>
          )}
        </div>

        <div className="comment-sheet__composer">
          <div className="comment-sheet__status">
            {status.message && (
              <span className={`status-chip ${status.type === "error" ? "is-error" : "is-success"}`}>
                {status.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
                {status.message}
              </span>
            )}
          </div>

          <div className="comment-sheet__input-row">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Add a comment"
            />
            <button
              type="button"
              className="shorts-primary-btn"
              onClick={handleSend}
              disabled={sending}
            >
              {sending ? <FiLoader className="spin" /> : <FiSend />}
              {sending ? "Sending" : "Send"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function UploadModal({ onClose, onUpload, uploading, progress, status }) {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");

  const fileLabel = file
    ? `${file.name} - ${(file.size / (1024 * 1024)).toFixed(2)} MB`
    : "Select an MP4 or other video file";

  return (
    <div className="upload-modal-backdrop" onClick={onClose}>
      <div
        className="upload-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="upload-modal__header">
          <div>
            <span>Upload reel</span>
            <strong>Create a new short video for the feed</strong>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} disabled={uploading}>
            <FiX />
          </button>
        </div>

        <label className="upload-dropzone">
          <input
            type="file"
            accept="video/*"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            disabled={uploading}
          />
          <FiUpload />
          <span>{fileLabel}</span>
          <small>Vertical videos work best for the reels layout.</small>
        </label>

        <label className="upload-field">
          <span>Caption</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Write a short caption..."
            maxLength={180}
            disabled={uploading}
          />
        </label>

        <div className="upload-helper-row">
          <span>{description.length}/180</span>
          {status.message && (
            <span className={`status-chip ${status.type === "error" ? "is-error" : "is-success"}`}>
              {status.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />}
              {status.message}
            </span>
          )}
        </div>

        {(uploading || progress > 0) && (
          <div className="upload-progress-shell">
            <div className="upload-progress">
              <div style={{ width: `${progress}%` }} />
            </div>
            <span>{progress}% uploaded</span>
          </div>
        )}

        <div className="upload-modal__actions">
          <button
            type="button"
            className="shorts-secondary-btn"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="shorts-primary-btn"
            onClick={() => onUpload(file, description)}
            disabled={uploading}
          >
            {uploading ? <FiLoader className="spin" /> : <FiUpload />}
            {uploading ? "Uploading..." : "Upload reel"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Shorts;
