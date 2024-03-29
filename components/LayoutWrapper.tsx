import { Outfit } from '@next/font/google';

import SectionContainer from './SectionContainer';
import Footer from './Footer';
import { ReactNode } from 'react';
import Header from './Header';

interface Props {
  children: ReactNode;
}

const inter = Outfit({
  subsets: ['latin'],
});

const LayoutWrapper = ({ children }: Props) => {
  return (
    <SectionContainer>
      <div className={`${inter.className} relative flex h-screen flex-col justify-between font-sans`}>
        <Header />
        <main className="mb-auto">{children}</main>
        <div className="bg-image-container bg-image-container-one"></div>
        <div className="bg-image-container bg-image-container-two h-3/6 w-3/6 md:h-3/6 md:w-3/6"></div>
        <Footer />
      </div>
    </SectionContainer>
  );
};

export default LayoutWrapper;
