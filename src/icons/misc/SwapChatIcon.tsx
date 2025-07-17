import { SvgIcon } from '../type'

export default function SwapChatIcon(props: SvgIcon) {
  return (
    <svg viewBox="0 0 18 18" width={18} height={18} fill="none" focusable="false" className="chakra-icon" {...props}>
      <path d="M1 2.5V15.5H17" stroke="#FF9D23" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3.5" y="6" width="3" height="7" fill="#FF9D23" />
      <rect x="8.5" y="4" width="3" height="9" fill="#FEF9E1" />
      <rect x="13.5" y="2" width="3" height="11" fill="#C14600" />
    </svg>
  )
}
