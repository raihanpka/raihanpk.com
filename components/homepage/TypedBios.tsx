import React from 'react';
import Typed from 'typed.js';

import Twemoji from '@/components/Twemoji';

const TypedBios = () => {
  const el = React.useRef(null);
  const typed = React.useRef(null);

  React.useEffect(() => {
    typed.current = new Typed(el.current, {
      stringsElement: '#bios',
      typeSpeed: 40,
      backSpeed: 10,
      loop: true,
      backDelay: 1000,
    });
    return () => typed.current.destroy();
  }, []);

  return (
    <div>
      <ul id="bios" className="hidden">
        <li>
          Aku biasa dipanggil dengan sebutan <b className="font-medium">Han atau Peka</b>.
        </li>
        <li>
          Aku tinggal di <b className="font-medium">Bogor, Indonesia</b>.
        </li>
        <li>
          Bahasa pemrograman yang pertama Aku pelajari adalah <b className="font-medium">JavaScript</b>.
        </li>
        <li>Aku sangat tertarik dengan dunia teknologi.</li>
        <li>
          Aku suka mendengarkan musik Jazz dan Pop.
        </li>
        <li>
          Aku senang bermain game <Twemoji emoji="video-game" />, Pokemon dan RDR2 adalah game favoritku.
        </li>
      </ul>
      <span ref={el} className="text-neutral-900 dark:text-neutral-200" />
    </div>
  );
};

export default TypedBios;
