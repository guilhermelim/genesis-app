'use client'

import Image from 'next/image'

export type GenesisLogoVariant = 'brand' | 'theme'

export default function GenesisLogo({
  variant = 'brand',
  className = 'size-7',
}: {
  variant?: GenesisLogoVariant
  className?: string
}) {
  return variant === 'theme' ? (
    <span
      className={`${className} bg-primary [mask-image:url('/genesis-logo.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]`}
      role="img"
      aria-label="Logo Genesis"
    />
  ) : (
    <Image
      src="/genesis-logo.svg"
      alt="Logo Genesis"
      width={28}
      height={28}
      className={`${className} object-contain`}
      unoptimized
    />
  )
}
