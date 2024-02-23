import Link from '@/components/Link';
import Twemoji from '@/components/Twemoji';

const BlogLinks = () => {
  return (
    <div className="flex justify-between ">
      <div className="flex flex-col space-y-1.5">
        <Link href="/blog" className="hover:underline">
          <Twemoji emoji="memo" />
          <span data-umami-event="home-link-blog" className="ml-1.5">
            Tulisanku
          </span>
        </Link>
        <Link href="/projects" className="hover:underline">
          <Twemoji emoji="hammer-and-wrench" />
          <span data-umami-event="home-link-projects" className="ml-1.5">
            Galeri
          </span>
        </Link>
      </div>
      <div className="flex flex-col space-y-1.5">
        <Link href="/about" className="hover:underline">
          <Twemoji emoji="face-with-monocle" />
          <span data-umami-event="home-link-about" className="ml-1.5">
            Selebihnya tentang diriku
          </span>
        </Link>
      </div>
    </div>
  );
};

export default BlogLinks;
