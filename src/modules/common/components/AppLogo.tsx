import Image from 'next/image';

export const AppLogo = () => (
  <div className="flex items-center">
    <Image alt="Viargos" className="block sm:hidden" height={40} src="/viargos.svg" unoptimized width={40} />
    <Image
      alt="Viargos"
      className="hidden sm:block"
      height={32}
      src="/viargos_full.svg"
      style={{ width: 'auto', height: 'auto' }}
      unoptimized
      width={130}
    />
  </div>
);
