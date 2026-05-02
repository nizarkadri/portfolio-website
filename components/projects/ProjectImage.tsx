import Image from 'next/image';
import clsx from 'clsx';
import { PROJECT_PLACEHOLDER_IMAGE } from '../../app/lib/project-shared';

interface ProjectImageProps {
  src?: string;
  alt: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
}

export function ProjectImage({
  src,
  alt,
  priority = false,
  fill = false,
  width = 1200,
  height = 720,
  sizes,
  className = '',
}: ProjectImageProps) {
  const resolvedSrc = src || PROJECT_PLACEHOLDER_IMAGE;

  if (fill) {
    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={clsx('object-cover object-center', className)}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className={clsx(className)}
    />
  );
}
