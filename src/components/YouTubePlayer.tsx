'use client';

import { useState, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

interface YouTubePlayerProps {
  videoId?: string;
  apiKey: string;
  className?: string;
}

export default function YouTubePlayer({ 
  videoId = 'DHDRltPtP4I', //원하는 비디오 id
  apiKey,
  className = '' 
}: YouTubePlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      // https://developers.google.com/youtube/player_parameters
      autoplay: 1,
      controls: 1,
      rel: 0,
      showinfo: 0,
      mute: 1, // 자동재생을 위해 음소거
      loop: 1,
      playlist: videoId, // 루프를 위해 필요
      modestbranding: 1,
      fs: 1,
      cc_load_policy: 0,
      iv_load_policy: 3,
      autohide: 0,
    },
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    console.log('YouTube Player is ready');
    setIsReady(true);
    setError(null);
    // 플레이어가 준비되면 재생 시작
    event.target.playVideo();
  };

  const onError: YouTubeProps['onError'] = (event) => {
    console.error('YouTube Player Error:', event.data);
    setError('비디오를 로드할 수 없습니다.');
    setIsReady(false);
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 비디오 상태 변경 시 로그
    console.log('YouTube Player State:', event.data);
  };

  // API 키가 없으면 에러 표시
  if (!apiKey) {
    return (
      <div className={`bg-black rounded-lg aspect-video flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <div className="w-24 h-24 bg-red-700 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-12 h-12 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-lg font-medium text-red-400">API 키가 필요합니다</p>
          <p className="text-sm text-gray-400">YouTube API 키를 설정해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black rounded-lg aspect-video relative overflow-hidden ${className}`}>
      {/* 로딩 상태 */}
      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-lg font-medium">비디오 로딩 중...</p>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-red-700 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-12 h-12 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-lg font-medium text-red-400">{error}</p>
            <p className="text-sm text-gray-400">비디오 ID나 네트워크를 확인해주세요</p>
          </div>
        </div>
      )}

      {/* YouTube Player */}
      <div className="w-full h-full">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onError={onError}
          onStateChange={onStateChange}
          className="w-full h-full"
          iframeClassName="w-full h-full rounded-lg"
        />
      </div>

      {/* 플레이어 정보 오버레이 (옵션) */}
      {isReady && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm">
          🔴 LIVE
        </div>
      )}
    </div>
  );
}

// 환경변수에서 API 키를 가져오는 헬퍼 함수
export const getYouTubeApiKey = (): string => {
  return process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
};
