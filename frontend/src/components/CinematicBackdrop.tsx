import type { SyntheticEvent } from 'react'

const pageVideo = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4'
const playbackRate = 0.7

function slowVideo(event: SyntheticEvent<HTMLVideoElement>) {
  event.currentTarget.playbackRate = playbackRate
}

export default function CinematicBackdrop() {
  return (
    <div className="cinematic-backdrop" aria-hidden="true">
      <video
        className="cinematic-backdrop-video"
        src={pageVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedMetadata={slowVideo}
        onPlay={slowVideo}
      />
    </div>
  )
}
