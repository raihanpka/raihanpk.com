import { useEffect, useState } from 'react'
import { FaSpotify, FaHeadphonesAlt } from 'react-icons/fa'
import { Skeleton } from '../ui/skeleton'
import { MoveUpRight } from 'lucide-react'

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
        fetch(
            'https://lastfm-last-played.biancarosa.com.br/raihanpka/latest-song',
        )
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
        <div className="relative flex h-full w-full justify-between gap-4 rounded-3xl pb-2">
            <Skeleton className="mb-2 rounded-xl w-28 h-28 max-h-32 max-w-32 mb-2 w-28 max-w-32" />
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-2 w-1/3" />
                  <Skeleton className="h-2 w-1/3" />
                </div>
              </div>
            <div className="absolute right-0 top-0 m-3 text-accent">
              <FaSpotify size={16} />
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
              <FaHeadphonesAlt size={16} />
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
      <div className="absolute right-0 top-0 m-2 hidden text-primary md:block">
        <FaSpotify size={16} />
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