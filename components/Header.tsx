import { useRouter } from 'next/router';
import clsx from 'clsx';

import siteMetadata from '@/data/siteMetadata';
import headerNavLinks from '@/data/headerNavLinks';

import Logo from 'public/static/images/newlogo.svg';

import Link from './Link';
import MobileNav from './MobileNav';
import ThemeSwitch from './ThemeSwitch';
import AnalyticsLink from './AnalyticsLink';

const Header = () => {
  const router = useRouter();

  return (
    <header className="z-10 flex items-center justify-between rounded-b-lg p-4 py-10">
      <div>
        <Link href="/" aria-label={siteMetadata.headerTitle} className="flex items-center">
          <div>
            <Logo className="fill-dark dark:fill-white" />
          </div>
          <div className="group ml-2 text-xl font-bold transition duration-300">
            pk.
            <span className="block h-0.5 max-w-0 bg-black transition-all duration-500 group-hover:max-w-[85%] dark:bg-white"></span>
          </div>
        </Link>
      </div>
      <div className="flex items-center text-base leading-5">
        <div className="hidden sm:block">
          {headerNavLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className={clsx(
                'rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-opacity-10 sm:p-4',
                router.pathname.startsWith(link.href)
                  ? 'bg-gray-200 dark:bg-primary'
                  : 'hover:bg-gray-200 dark:hover:bg-primary'
              )}
              data-umami-event={`nav-${link.href.replace('/', '')}`}
            >
              {link.title}
            </Link>
          ))}
        </div>
        <AnalyticsLink />
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  );
};

export default Header;
