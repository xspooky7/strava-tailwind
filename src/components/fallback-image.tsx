import { useState } from "react"
import Image from "next/image"

export const FallbackImage = ({ src, fallbackSrc, alt, ...props }: any) => {
  const [imgSrc, setImgSrc] = useState(src)

  const handleError = () => {
    setImgSrc(fallbackSrc)
  }

  return <Image src={imgSrc} alt={alt} onError={handleError} {...props} />
}
