import { MoveUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FaHeadphonesAlt, FaSpotify } from 'react-icons/fa'
import { motion } from 'framer-motion'
import {
  getCachedData,
  setCachedData,
  CACHE_TTL,
  CACHE_KEYS,
} from '@/lib/cache'

interface Track {
  name: string
  artist: { '#text': string }
  album: { '#text': string }
  image: { '#text': string }[]
  url: string
  '@attr'?: { nowplaying: string }
}

const SpotifyPresence = () => {
  const [displayData, setDisplayData] = useState<Track | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check cache first for faster loading
    const cached = getCachedData<Track>(CACHE_KEYS.LASTFM)
    if (cached) {
      setDisplayData(cached)
      setIsLoading(false)
      return
    }

    // Fetch fresh data if cache miss
    fetch('https://lastfm-last-played.biancarosa.com.br/raihanpka/latest-song')
      .then((response) => response.json())
      .then((data) => {
        // Cache the result for faster subsequent loads
        setCachedData(CACHE_KEYS.LASTFM, data.track, CACHE_TTL.LASTFM)
        setDisplayData(data.track)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error fetching latest song:', error)
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="relative flex h-full w-full flex-col items-start justify-between gap-4 p-2 md:flex-row md:items-center">
        <div className="relative flex h-full w-full flex-row items-start justify-between gap-4">
          {/* Album art skeleton */}
          <div className="mb-2 w-28 max-w-[170px] h-28 max-h-[160px] animate-pulse rounded-xl border border-border bg-primary/10" />
          <div className="flex min-w-0 flex-1 flex-col justify-end overflow-hidden">
            <div className="flex flex-col">
              {/* Icon + "Listening to..." text skeleton */}
              <span className="mb-1 flex gap-2 items-center">
                <div className="h-4 w-4 animate-pulse rounded bg-primary/10" />
                <div className="h-4 w-24 animate-pulse rounded bg-primary/10" />
              </span>
              {/* Song title skeleton */}
              <div className="mb-2 pb-1 h-8 w-48 animate-pulse rounded bg-primary/10" />
              {/* Artist skeleton */}
              <div className="h-4 w-[60%] animate-pulse rounded bg-primary/10" />
              {/* Album skeleton */}
              <div className="h-4 w-[50%] animate-pulse rounded bg-primary/10 mt-1" />
            </div>
          </div>
        </div>
        {/* Spotify icon skeleton */}
        <div className="absolute right-1 top-0 m-2">
          <div className="h-6 w-6 animate-pulse rounded-full bg-primary/10" />
        </div>
        {/* Link button skeleton */}
        <div className="absolute bottom-0 right-0 m-3 h-10 w-10 animate-pulse rounded-full bg-primary/10" />
      </div>
    )
  }

  if (!displayData)
    return (
      <motion.div
        className="relative flex h-full w-full flex-row items-start justify-between gap-4 p-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Album art placeholder */}
        <div className="mb-2 flex w-28 max-w-[160px] shrink-0 items-center justify-center rounded-xl border border-border bg-secondary/40 aspect-square">
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 1.6, ease: 'easeInOut', delay: 0.3 }}
          >
            <FaSpotify size={36} className="text-muted-foreground/50" />
          </motion.div>
        </div>

        {/* Text area */}
        <div className="flex min-w-0 flex-1 flex-col justify-end overflow-hidden">
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <FaHeadphonesAlt size={14} />
              Signal lost...
            </span>
            <span className="truncate text-lg font-bold leading-tight text-primary/80">
              Couldn't reach Last.fm API
            </span>
            <span className="text-sm text-muted-foreground leading-snug">
              The API dropped the mic. Check back later.
            </span>
          </div>
        </div>

        {/* Spotify icon */}
        <div className="absolute right-1 top-0 m-2 text-muted-foreground/40">
          <FaSpotify size={24} />
        </div>
      </motion.div>
    )

  const { name: song, artist, album, image, url } = displayData

  return (
    <motion.div
      className="relative flex h-full w-full flex-col items-start justify-between gap-4 p-2 md:flex-row md:items-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="relative flex h-full w-full flex-row items-start justify-between gap-4">
        <motion.img
          src={image[3]['#text']}
          alt="Album art"
          width={160}
          height={160}
          className="mb-2 w-28 max-w-[160px] rounded-xl border border-border grayscale md:w-full"
          whileHover={{ scale: 1.05, rotate: 1.5 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        <div className="flex min-w-0 flex-1 flex-col justify-end overflow-hidden">
          <div className="flex flex-col">
            <span className="mb-1 flex gap-2 text-primary items-center">
              {displayData['@attr']?.nowplaying === 'true' ? (
                <div className="flex items-center space-x-1">
                  <div
                    className="w-0.5 h-1.5 bg-primary/90 rounded-full animate-pulse"
                    style={{ animationDelay: '0ms', animationDuration: '1.5s' }}
                  />
                  <div
                    className="w-0.5 h-2 bg-primary/70 rounded-full animate-pulse"
                    style={{
                      animationDelay: '150ms',
                      animationDuration: '1.2s',
                    }}
                  />
                  <div
                    className="w-0.5 h-3 bg-primary/60 rounded-full animate-pulse"
                    style={{
                      animationDelay: '300ms',
                      animationDuration: '1.5s',
                    }}
                  />
                  <div
                    className="w-0.5 h-2 bg-primary/90 rounded-full animate-pulse"
                    style={{
                      animationDelay: '450ms',
                      animationDuration: '1.2s',
                    }}
                  />
                  <div
                    className="w-0.5 h-2.5 bg-primary/80 rounded-full animate-pulse"
                    style={{
                      animationDelay: '600ms',
                      animationDuration: '1.5s',
                    }}
                  />
                </div>
              ) : (
                <FaHeadphonesAlt size={16} />
              )}
              <span className="text-sm text-primary">
                {displayData['@attr']?.nowplaying === 'true'
                  ? 'Listening to...'
                  : 'Last played...'}
              </span>
            </span>
            <span className="mb-2 pb-1 truncate text-2xl font-bold leading-none text-primary">
              {song}
            </span>
            <span className="w-[85%] truncate text-sm text-muted-foreground">
              <span className="font-semibold text-secondary-foreground">
                by
              </span>{' '}
              {artist['#text']}
            </span>
            <span className="w-[85%] truncate text-sm text-muted-foreground">
              <span className="font-semibold text-secondary-foreground">
                on
              </span>{' '}
              {album['#text']}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute right-1 top-0 m-2 text-primary">
        <FaSpotify size={24} />
      </div>
      <a
        href={url}
        aria-label="View on last.fm"
        title="View on last.fm"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-0 right-0 m-3 flex w-fit items-end rounded-full border bg-secondary/50 p-3 text-primary transition-all duration-300 hover:rotate-12 hover:ring-1 hover:ring-primary"
      >
        <MoveUpRight size={16} />
      </a>
    </motion.div>
  )
}

export default SpotifyPresence
