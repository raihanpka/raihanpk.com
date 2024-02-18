import siteMetadata from '@/data/siteMetadata';

import { Twemoji } from '@/components/Twemoji';

const Heading = () => {
  return (
    <h1 className="font-medium text-neutral-900 dark:text-neutral-200">
      Namaku <span>{siteMetadata.fullName}</span> - seorang <span>mahasiswa</span> di{' '}
      <span className="hidden">Bogor, Indonesia.</span>
      <span className="absolute ml-1.5 inline-flex pt-[3px]">
        <Twemoji emoji="indonesia-flag" />
      </span>
    </h1>
  );
};

export default Heading;
