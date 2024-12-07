// File: src/config/HeaderStyleConfig.js

const HeaderStyleConfig = {
    desktop: {
      container: 'hidden lg:flex w-full bg-gradient-to-b from-[#141852] to-[#0E1139] backdrop-blur-lg border-b border-white/10 shadow-md',
      innerContainer: 'container mx-auto px-8 flex items-center justify-between h-20',
      logo: 'w-12 h-12',
      navLink: 'text-white text-base font-semibold hover:text-blue-400 transition duration-300',
      walletButtonContainer: 'ml-auto',
    },
    mobile: {
      container: 'lg:hidden flex flex-col w-full bg-gradient-to-b from-[#141852] to-[#0E1139]',
      topSection: 'flex items-center justify-between w-full px-6 py-4 border-b border-white/10',
      logo: 'w-10 h-10',
      navBarContainer: 'fixed bottom-0 w-full flex items-center justify-around h-14 bg-gradient-to-b from-[#141852] to-[#0E1139] backdrop-blur-lg border-t border-white/10 shadow-lg z-50',
      navButton: 'flex flex-col items-center text-white text-sm font-medium hover:brightness-125 transition',
    },
  };
  
  export default HeaderStyleConfig;
  