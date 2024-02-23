import clsx from 'clsx';

const Greeting = () => {
  const className = clsx(
    'clip bg-gradient-to-r from-gray-500 to-slate-400',
    'mb-8 bg-clip-text text-4xl font-extrabold leading-[60px] tracking-tight text-transparent md:text-7xl md:leading-[86px]'
  );

  return (
    <div className={className}>
      Hello, everyone! <span className="font-bold">Welcome to my digital home.</span>
    </div>
  );
};

export default Greeting;
