import { SVGProps } from 'react'
import { BoxProps } from '@chakra-ui/react'
import type { HTMLChakraProps } from '@chakra-ui/react';


export type SvgIcon = React.SVGProps<SVGSVGElement> & BoxProps & Omit<React.SVGProps<SVGElement>, keyof BoxProps> & HTMLChakraProps<'svg'>
