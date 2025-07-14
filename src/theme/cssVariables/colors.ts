export const darkColors: Record<keyof typeof colors, string> = {
  // app main bg color
  primary: '#ffd7ab',
  secondary: '#f8d222',
  secondary10: 'rgba(34, 209, 248, 0.1)',

  // component color
  backgroundDark: '#22190b',
  backgroundDark50: '#22190b80',
  backgroundMedium: '#705732',
  backgroundLight: '#3e301c',
  backgroundLight50: '#3e301c88',
  backgroundLight30: '#3e301c4d',
  backgroundTransparent12: 'rgba(171, 196, 255, 0.12)',
  backgroundTransparent07: 'rgba(171, 196, 255, 0.07)',
  backgroundTransparent10: 'rgba(171, 196, 255, 0.1)',

  // text
  textPrimary: '#ECF5FF',
  textSecondary: '#ffd7ab',
  textTertiary: '#ffd7ab80',
  textRevertPrimary: '#211c0d',

  textLink: '#f8d222',

  /** 🤔 what's this */
  textQuaternary: '#C4D6FF',
  /** 🤔 what's this */
  textQuinary: '#1C243E',
  /** 🤔 what's this */
  textSenary: 'rgba(196, 214, 255, 0.5)',
  /** 🤔 what's this */
  textSeptenary: '#f8d222',
  /** 🤔 what's this */
  textPurple: '#aaef6e',
  /** 🤔 what's this */
  textPink: '#FF4EA3',

  textLaunchpadLink: '#f8d222',

  // button
  buttonPrimary: '#f8d222',
  buttonPrimary__01: '#f8d222',
  buttonPrimary__02: '#39D0D8',
  buttonSolidText: '#0B1022',
  buttonSecondary: '#aaef6e',

  // switch
  switchOn: '#f8bb22',
  switchOff: '#ffd7ab',

  // select
  selectActive: '#ffd7ab',
  selectActiveSecondary: '#f8d222',
  selectInactive: '#ffd7ab1a',

  // chart
  chart01: '#ffd7ab',
  chart02: '#39D0D8',
  chart03: '#aaef6e',
  chart04: '#2B6AFF',
  chart05: '#FF7043',
  chart06: '#FED33A',
  chart07: '#4F53F3',
  chart08: '#f8d222',
  chart09: '#8C6EEF33',

  // Icon
  iconBg: '#8CA7E8',
  iconEmptyStroke: '#0B1022',

  // success/warning/error/info
  semanticSuccess: '#f8d222',
  semanticError: '#FF4EA3',
  semanticWarning: '#FED33A',
  semanticNeutral: '#ffd7ab',
  semanticFocus: '#A259FF',
  semanticFocusShadow: '#A259FF33',

  // Tab
  tabFolderTabListBg: 'var(--background-light-opacity)',

  // Step
  stepActiveBg: 'var(--background-light)',
  stepHoofBg: 'var(--primary)',

  // +1% is priceFloatingUp; -1% is priceFloatingDown
  priceFloatingUp: '#f8d222',
  priceFloatingDown: '#FF4EA3',
  priceFloatingFlat: '#888888',

  // tooltip (this color is not in figma ui color system,but in figma ui page)
  tooltipBg: '#81622b',

  popoverBg: '#141f3a',

  //customize (by V3 frontend coder)
  scrollbarThumb: 'rgba(255, 255, 255, 0.2)',

  // badge
  badgePurple: 'rgba(140, 110, 239, 0.5)',
  badgeBlue: 'rgba(34, 209, 248, 0.5)',

  // divider
  dividerBg: 'rgba(171, 196, 255, 0.12)',

  // input
  inputMask: '#0B102266',

  // customize (by V3 frontend coder)
  backgroundApp: 'linear-gradient(29.71deg, #342612 -18.98%, #171105 14.6%, #150e07 56.26%, rgb(29 20 9 / 97%) 85.27%)',
  solidButtonBg: 'linear-gradient(272.03deg, #a2d839 2.63%, #aff822 95.31%)',
  outlineButtonBg: 'linear-gradient(272.03deg, rgba(57, 208, 216, 0.1) 2.63%, rgba(34, 209, 248, 0.1) 95.31%)',
  filledProgressBg: 'linear-gradient(270deg, #aaef6e 0%, #4F53F3 100%)',
  transparentContainerBg: 'linear-gradient(271.31deg, rgba(96, 59, 200, 0.2) 1.47%, rgba(140, 110, 239, 0.12) 100%)',
  cardStackBg: 'linear-gradient(89.25deg, #174756 0.37%, #1A2A5F 52.97%, #3E1958 99.74%)',
  modalContainerBg: '#ffd7ab12',
  infoButtonBg: '#ffd7ab33',
  warnButtonBg: '#FED33A33',
  warnButtonLightBg: '#FED33A1A',
  buttonBg01: '#ffd7ab1F',
  lightPurple: '#fff3bf',
  background01: '#090D1D',
  background02: 'rgba(22, 22, 22, 0.5)',
  background03: '#FF4EA31A',
  cardBorder01: '#8C6EEF80',
  text01: '#D6CC56',
  text02: '#fff',
  text03: '#b5b7da',
  /** it's designer's variable name in Figma */
  brandGradient: 'linear-gradient(244deg,rgb(252, 168, 72) 8.17%,rgb(205, 216, 57) 101.65%)',
  dividerDashGradient: 'repeating-linear-gradient(to right, currentColor 0 5px, transparent 5px 10px)',

  tokenAvatarBg: 'linear-gradient(127deg, rgba(171, 196, 255, 0.20) 28.69%, rgba(171, 196, 255, 0.00) 100%) #0b102280',

  panelCardShadow: '0px 8px 24px rgba(79, 83, 243, 0.12)',
  panelCardBorder: 'unset',

  positive: '#dcbf4c',
  negative: '#ff006b'
}

export const lightColors: Partial<typeof darkColors> = {
  // app main bg color
  primary: '#ffd7ab',
  secondary: '#4F53F3',
  secondary10: 'rgba(34, 209, 248, 0.1)',

  // component color
  backgroundDark: '#fffaed',
  backgroundDark50: '#fffaed80',
  backgroundMedium: '#fffaed',
  backgroundLight: '#F5F8FF',
  backgroundLight50: '#F5F8FF88',
  backgroundLight30: '#F5F8FF4d',
  backgroundTransparent12: 'rgba(171, 196, 255, 0.12)',
  backgroundTransparent07: 'rgba(171, 196, 255, 0.07)',
  backgroundTransparent10: 'rgba(171, 196, 255, 0.1)',

  // text
  textPrimary: '#0B1022',
  textSecondary: '#bb7f47',
  textTertiary: '#bb7f4799',
  textRevertPrimary: '#ECF5FF',

  textLink: '#22D1F8',

  /** 🤔 what's this */
  textQuaternary: '#C4D6FF',
  /** 🤔 what's this */
  textQuinary: '#ECF5FF',
  /** 🤔 what's this */
  textSenary: 'rgba(196, 214, 255, 0.5)',
  /** 🤔 what's this */
  textSeptenary: '#22D1F8',
  /** 🤔 what's this */
  textPurple: '#aaef6e',
  /** 🤔 what's this */
  textPink: '#FF4EA3',

  textLaunchpadLink: '#aaef6e',

  // button
  buttonPrimary: '#4F53F3',
  buttonPrimary__01: '#4F53F3',
  buttonPrimary__02: '#aaef6e',
  buttonSolidText: '#ECF5FF',
  buttonSecondary: '#39D0D8',

  // switch
  switchOn: '#aaef6e',
  switchOff: '#8C6EEF80',

  // select
  selectActive: '#aaef6e',
  selectActiveSecondary: '#aaef6e',
  selectInactive: '#abc4ffef',

  // chart
  chart01: '#abc4ff',
  chart02: '#39D0D8',
  chart03: '#aaef6e',
  chart04: '#2B6AFF',
  chart05: '#FF7043',
  chart06: '#FED33A',
  chart07: '#4F53F3',
  chart08: '#22D1F8',
  chart09: '#8C6EEF33',

  // Icon
  iconBg: '#aaef6e',
  iconEmptyStroke: '#ECF5FF',

  // success/warning/error/info
  semanticSuccess: '#39D0D8',
  semanticError: '#FF4EA3',
  semanticWarning: '#B89900',
  semanticNeutral: '#ABC4FF',
  semanticFocus: '#A259FF',
  semanticFocusShadow: '#A259FF33',

  // Tab
  tabFolderTabListBg: 'var(--background-dark)',

  // Step
  stepActiveBg: 'var(--background-dark-opacity)',
  stepHoofBg: 'var(--secondary)',

  // +1% is priceFloatingUp; -1% is priceFloatingDown
  priceFloatingUp: '#22D1F8',
  priceFloatingDown: '#FF4EA3',
  priceFloatingFlat: '#888888',

  // tooltip (this color is not in figma ui color system,but in figma ui page)
  tooltipBg: '#fff',

  popoverBg: '#fff',

  //customize (by V3 frontend coder)
  scrollbarThumb: 'rgba(196, 214, 255, 0.5)',

  // badge
  badgePurple: 'rgba(140, 110, 239, 0.5)',
  badgeBlue: 'rgba(34, 209, 248, 0.5)',

  // divider
  dividerBg: 'rgba(171, 196, 255, 0.3)',

  // input
  inputMask: '#fff3',

  // customize (by V3 frontend coder)
  backgroundApp: '#fff',

  solidButtonBg: 'linear-gradient(272deg,rgb(243, 186, 79) 2.63%,rgb(215, 239, 110) 95.31%)',
  outlineButtonBg: 'linear-gradient(270deg, #8C6EEF1a 0%, #4F53F31a 100%)',
  filledProgressBg: 'linear-gradient(270deg, #aaef6e 0%, #4F53F3 100%)',
  transparentContainerBg: '#F5F8FF',
  cardStackBg: 'linear-gradient(90deg, #EEF7FF 0%, #FBEDFF 100%)',
  modalContainerBg: '#ABC4FF12',
  infoButtonBg: '#ABC4FF33',
  warnButtonBg: '#FED33A33',
  warnButtonLightBg: '#FED33A1A',
  buttonBg01: '#ABC4FF1F',
  lightPurple: '#bb7f47',
  background01: '#EDEDFF',
  background02: '#ABC4FF33',
  background03: '#FF4EA31A',
  cardBorder01: '#8C6EEF80',
  text01: '#D6CC56',
  text02: '#000',
  text03: '#bb7f47',
  /** it's designer's variable name in Figma */
  brandGradient: 'linear-gradient(244deg,rgb(32, 22, 9) 8.17%,rgb(36, 39, 10) 101.65%)',
  dividerDashGradient: 'repeating-linear-gradient(to right, currentColor 0 5px, transparent 5px 10px)',

  tokenAvatarBg: 'linear-gradient(127deg, rgba(171, 196, 255, 0.20) 28.69%, rgba(171, 196, 255, 0.00) 100%) #fffe',

  panelCardShadow: 'none',
  panelCardBorder: '1px solid rgba(171, 196, 255, 0.50)',

  positive: '#4CDCC1',
  negative: '#FF4272'
}
/**
 * note: it is not colors value, but colors css variable
 * color info may change in run-time by setting page, so use runtime css variable
 */
export const colors = {
  // app main bg color
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  secondary10: 'var(--secondary10)',

  // component color
  backgroundDark: 'var(--background-dark)',
  backgroundDark50: 'var(--background-dark50)',
  backgroundMedium: 'var(--background-medium)',
  backgroundLight: 'var(--background-light)',
  backgroundLight50: 'var(--background-light50)',
  backgroundLight30: 'var(--background-light30)',
  backgroundTransparent12: 'var(--background-transparent12)',
  backgroundTransparent07: 'var(--background-transparent07)',
  backgroundTransparent10: 'var(--background-transparent10)',

  // text
  /** white */
  textPrimary: 'var(--text-primary)',
  /** #abc4ff */
  textSecondary: 'var(--text-secondary)',
  /** #abc4ff80 */
  textTertiary: 'var(--text-tertiary)',
  textRevertPrimary: 'var(--text-revert-primary)',

  textLink: 'var(--text-link)',

  /** 🤔 what's this */
  textQuaternary: 'var(--text-quaternary)',
  /** 🤔 what's this */
  textQuinary: 'var(--text-quinary)',
  /** 🤔 what's this */
  textSenary: 'var(--text-senary)',
  /** 🤔 what's this */
  textSeptenary: 'var(--text-septenary)',
  /** 🤔 what's this */
  textPurple: 'var(--text-purple)',
  /** 🤔 what's this */
  textPink: 'var(--text-pink)',

  textLaunchpadLink: 'var(--text-launchpad-link)',

  // button
  buttonPrimary: 'var(--button-primary)',
  buttonPrimary__01: 'var(--button-primary__01)',
  buttonPrimary__02: 'var(--button-primary__02)',
  buttonSolidText: 'var(--button-solid-text)',
  buttonSecondary: 'var(--button-secondary)',

  // switch
  switchOn: 'var(--switch-on)',
  switchOff: 'var(--switch-off)',
  selectActive: 'var(--select-active)',
  selectActiveSecondary: 'var(--select-active-secondary)',
  selectInactive: 'var(--select-inactive)',

  // chart
  chart01: 'var(--chart01)',
  chart02: 'var(--chart02)',
  chart03: 'var(--chart03)',
  chart04: 'var(--chart04)',
  chart05: 'var(--chart05)',
  chart06: 'var(--chart06)',
  chart07: 'var(--chart07)',
  chart08: 'var(--chart08)',
  chart09: 'var(--chart09)',

  // Icon
  iconBg: 'var(--icon-bg)',
  iconEmptyStroke: 'var(--icon-empty-stroke)',

  // success/warning/error/info
  semanticSuccess: 'var(--semantic-success)',
  semanticError: 'var(--semantic-error)',
  semanticWarning: 'var(--semantic-warning)',
  semanticNeutral: 'var(--semantic-neutral)',
  semanticFocus: 'var(--semantic-focus)',
  semanticFocusShadow: 'var(--semantic-focus-shadow)',

  // Tab
  tabFolderTabListBg: 'var(--tab-folder-tab-list-bg)',

  // Step
  stepActiveBg: 'var(--step-active-bg)',
  stepHoofBg: 'var(--step-hoof-bg)',

  // +1% is priceFloatingUp; -1% is priceFloatingDown
  priceFloatingUp: 'var(--price-floating-up)',
  priceFloatingDown: 'var(--price-floating-down)',
  priceFloatingFlat: 'var(--price-floating-flat)',

  // tooltip (this color is not in figma ui color system,but in figma ui page)
  tooltipBg: 'var(--tooltip-bg)',

  popoverBg: 'var(--popover-bg)',

  //customize component theme (by V3 frontend coder)
  scrollbarThumb: 'var(--scrollbar-thumb)',

  // badge
  badgePurple: 'var(--badge-purple)',
  badgeBlue: 'var(--badge-blue)',

  // divider
  dividerBg: 'var(--divider-bg)',

  // input
  inputMask: 'var(--input-mask)',

  // customize (by V3 frontend coder)
  backgroundApp: 'var(--background-app)',
  solidButtonBg: 'var(--solid-button-bg)',
  outlineButtonBg: 'var(--outline-button-bg)',
  filledProgressBg: 'var(--filled-progress-bg)',
  transparentContainerBg: 'var(--transparent-container-bg)',
  cardStackBg: 'var(--card-stack-bg)',
  modalContainerBg: 'var(--modal-container-bg)',
  infoButtonBg: 'var(--info-button-bg)',
  warnButtonBg: 'var(--warn-button-bg)',
  warnButtonLightBg: 'var(--warn-button-light-bg)',
  buttonBg01: 'var(--button-bg-01)',
  lightPurple: 'var(--divider-bg-light-purple)',
  background01: 'var(--background-01)',
  background02: 'var(--background-02)',
  background03: 'var(--background-03)',
  cardBorder01: 'var(--card-border-01)',
  text01: 'var(--text-01)',
  text02: 'var(--text-02)',
  text03: 'var(--text-03)',
  /** it's designer's variable name in Figma */
  brandGradient: 'var(--brand-gradient)',
  dividerDashGradient: 'var(--divider-dash-gradient)',

  tokenAvatarBg: 'var(--token-avatar-bg)',

  panelCardShadow: 'var(--panel-card-shadow)',
  panelCardBorder: 'var(--panel-card-border)',

  positive: 'var(--positive)',
  negative: 'var(--negative)'
}
