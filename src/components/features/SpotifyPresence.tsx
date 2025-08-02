import { MoveUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FaHeadphonesAlt, FaSpotify } from 'react-icons/fa'
import { Skeleton } from '../ui/skeleton'

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
    fetch('https://lastfm-last-played.biancarosa.com.br/raihanpka/latest-song')
      .then((response) => response.json())
      .then((data) => {
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
          <Skeleton className="mb-2 w-28 max-w-32 h-28 max-h-32 rounded-xl border border-border grayscale md:w-full" />
          <div className="flex min-w-0 flex-1 flex-col justify-end overflow-hidden">
            <div className="flex flex-col">
              <span className="mb-1 flex gap-2 text-primary">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </span>
              <Skeleton className="mb-2 h-7 w-32 rounded" />
              <Skeleton className="h-4 w-[40%] rounded" />
              <Skeleton className="h-4 w-[40%] rounded mt-1" />
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 m-2 text-primary">
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <Skeleton className="absolute bottom-0 right-0 m-3 h-10 w-10 rounded-full" />
      </div>
    )
  }

  if (!displayData) return <p>Something absolutely horrible has gone wrong</p>

  const { name: song, artist, album, image, url } = displayData

  return (
    <div className="relative flex h-full w-full flex-col items-start justify-between gap-4 p-2 md:flex-row md:items-center">
      <div className="relative flex h-full w-full flex-row items-start justify-between gap-4">
        <img
          src={image[3]['#text']}
          alt="Album art"
          width={128}
          height={128}
          className="mb-2 w-28 max-w-32 rounded-xl border border-border grayscale md:w-full"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-end overflow-hidden">
          <div className="flex flex-col">
            <span className="mb-1 flex gap-2 text-primary">
              {displayData['@attr']?.nowplaying === 'true' ? (
                <div className="flex items-center space-x-1">
                  <div className="w-0.5 h-1.5 bg-primary/90 rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '1.5s' }}></div>
                  <div className="w-0.5 h-2 bg-primary/70 rounded-full animate-pulse" style={{ animationDelay: '150ms', animationDuration: '1.2s' }}></div>
                  <div className="w-0.5 h-3 bg-primary/60 rounded-full animate-pulse" style={{ animationDelay: '300ms', animationDuration: '1.5s' }}></div>
                  <div className="w-0.5 h-2 bg-primary/90 rounded-full animate-pulse" style={{ animationDelay: '450ms', animationDuration: '1.2s' }}></div>
                  <div className="w-0.5 h-2.5 bg-primary/80 rounded-full animate-pulse" style={{ animationDelay: '600ms', animationDuration: '1.5s' }}></div>
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
            <span className="mb-2 truncate text-xl font-bold leading-none text-primary">
              {song}
            </span>
            <span className="w-[85%] truncate text-xs text-muted-foreground">
              <span className="font-semibold text-secondary-foreground">
                by
              </span>{' '}
              {artist['#text']}
            </span>
            <span className="w-[85%] truncate text-xs text-muted-foreground">
              <span className="font-semibold text-secondary-foreground">
                on
              </span>{' '}
              {album['#text']}
            </span>
          </div>
        </div>
      </div>
      <div className="absolute right-1 top-1 m-2 text-primary">
        {isLoading ? (
          <Skeleton className="h-4 w-4 rounded-full" />
        ) : (
          <FaSpotify size={16} />
        )}
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
    </div>
  )
}

export default SpotifyPresence
