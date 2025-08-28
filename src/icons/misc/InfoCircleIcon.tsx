// /icons/misc/InfoCircleIcon.tsx
import React, { forwardRef } from 'react';
import { chakra } from '@chakra-ui/react';
import type { SvgIcon } from '../type';

const Base = forwardRef<SVGSVGElement, React.ComponentProps<'svg'>>(function Base(
  props,
  ref
) {
  return (
    <svg
      ref={ref}
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="currentColor"
      className="chakra-icon"
      {...props}
    >
      {/* paths... */}
    </svg>
  );
});

// Now this component accepts Chakra props like color, _dark, boxSize, etc.
const InfoCircleIcon = chakra(Base);

export default InfoCircleIcon;
