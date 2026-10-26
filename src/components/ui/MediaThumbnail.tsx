'use client'

import React, { useState } from 'react'
import { Video, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { isMediaVideo } from '@/lib/gallery/utils'

export interface MediaThumbnailProps {
  media: any
  alt?: string
  className?: string
  imageClassName?: string
  videoClassName?: string
  showVideoBadge?: boolean
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  badgeSize?: 'sm' | 'md'
  showHoverPlayEffect?: boolean
}

/**
 * Universal media thumbnail component that seamlessly renders both photos and videos.
 * For videos, it attempts to use a poster/thumbnail image if available.
 * If not, it leverages HTML5 video frame seeking (#t=0.001) to render the video's first frame
 * visually identical to a photo thumbnail, avoiding broken images and solid black boxes.
 */
export function MediaThumbnail({
  media,
  alt = 'Media',
  className = '',
  imageClassName = 'w-full h-full object-cover',
  videoClassName = 'w-full h-full object-cover pointer-events-none',
  showVideoBadge = false,
  badgePosition = 'top-left',
  badgeSize = 'sm',
  showHoverPlayEffect = false,
}: MediaThumbnailProps) {
  const [hasError, setHasError] = useState(false)

  if (!media) {
    return (
      <div className={`w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 ${className}`}>
        <ImageIcon className="w-5 h-5 opacity-40" />
      </div>
    )
  }

  const isVid = isMediaVideo(media)

  // Resolve thumbnail image URL if available
  const posterUrl =
    media?.videoThumbnail?.sizes?.thumbnail?.url ||
    media?.videoThumbnail?.url ||
    null

  const imageUrl =
    posterUrl ||
    media?.sizes?.thumbnail?.url ||
    media?.sizes?.card?.url ||
    (!isVid ? (typeof media === 'string' ? media : media?.url) : null)

  const videoUrl = isVid ? (typeof media === 'string' ? media : media?.url) : null
  const displayTitle = media?.title || media?.filename || alt

  // Badge position styling
  const badgePositionClass = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  }[badgePosition]

  // Fallback state if media fails to load completely
  if (hasError) {
    return (
      <div className={`w-full h-full bg-slate-900 flex flex-col items-center justify-center p-2 text-center text-slate-300 relative select-none ${className}`}>
        {isVid ? (
          <>
            <Video className="w-6 h-6 text-amber-400 mb-1" />
            <span className="text-[10px] font-semibold text-slate-200 line-clamp-1">{displayTitle}</span>
            <span className="text-[8px] text-amber-400/90 font-mono uppercase mt-0.5">Video Dokumentasi</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 text-slate-400 mb-1" />
            <span className="text-[10px] text-slate-400 line-clamp-1">{displayTitle}</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* 1. If it's an image OR a video with a valid poster image */}
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={displayTitle}
          onError={() => setHasError(true)}
          className={imageClassName}
          loading="lazy"
        />
      ) : isVid && videoUrl ? (
        /* 2. Video without poster: Render video element with frame-seeking to show first frame like photo */
        <video
          src={`${videoUrl}#t=0.001`}
          preload="metadata"
          muted
          playsInline
          disablePictureInPicture
          disableRemotePlayback
          onError={() => setHasError(true)}
          onLoadedMetadata={(e) => {
            // Seek to 0.001s to ensure Chromium and WebKit render the first frame on load
            try {
              if (e.currentTarget.currentTime === 0) {
                e.currentTarget.currentTime = 0.001
              }
            } catch (_) {
              // Ignore browser seek restriction if any
            }
          }}
          className={videoClassName}
        />
      ) : (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
          <ImageIcon className="w-5 h-5 opacity-40" />
        </div>
      )}

      {/* Video Badge indicator */}
      {isVid && showVideoBadge && (
        <div
          className={`absolute ${badgePositionClass} z-10 flex items-center gap-1 bg-black/75 backdrop-blur-xs text-white rounded font-bold shadow-sm select-none pointer-events-none ${
            badgeSize === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[10px]'
          }`}
        >
          <Video className={`${badgeSize === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-amber-400`} />
          <span>VIDEO</span>
        </div>
      )}

      {/* Optional subtle hover play icon */}
      {isVid && showHoverPlayEffect && (
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-black/60 text-amber-400 flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-md">
            <svg className="w-4 h-4 fill-amber-400 ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
