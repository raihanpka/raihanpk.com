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
          Aku lahir di <b className="font-medium">Bogor, Jawa Barat</b>.
        </li>
        <li>
          Aku juga tinggal di <b className="font-medium">Bogor, Jawa Barat</b>.
        </li>
        <li>Aku tertarik dengan dunia teknologi sejak kecil.</li>
        <li>
          Bahasa pemrograman pertamaku adalah <b className="font-medium">JS</b>.
        </li>
        <li>Aku suka musik bergenre Jazz dan Pop.</li>
        <li>
          Aku juga suka <Twemoji emoji="camera-with-flash" />.
        </li>
      </ul>
      <span ref={el} className="text-neutral-900 dark:text-neutral-200" />
    </div>
  );
};

export default TypedBios;
