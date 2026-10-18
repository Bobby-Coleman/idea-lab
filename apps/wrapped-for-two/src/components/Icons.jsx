const P = (d, extra = {}) => (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...extra} {...props}>
    {d}
  </svg>
)
export const IconBack = P(<path d="M15 5l-7 7 7 7" />)
export const IconClose = P(<path d="M6 6l12 12M18 6L6 18" />)
export const IconPlus = P(<path d="M12 5v14M5 12h14" />)
export const IconPlay = P(<path d="M8 5.5v13l11-6.5z" fill="currentColor" />)
export const IconShare = P(<><path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" /></>)
export const IconLink = P(<><path d="M10 14a4 4 0 006 0l3-3a4 4 0 00-6-6l-1 1" /><path d="M14 10a4 4 0 00-6 0l-3 3a4 4 0 006 6l1-1" /></>)
export const IconImage = P(<><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></>)
export const IconCamera = P(<><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>)
export const IconSound = P(<><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" /><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" /></>)
export const IconMute = P(<><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" /><path d="M17 9l5 6M22 9l-5 6" /></>)
export const IconLock = P(<><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 018 0v3" /></>)
export const IconCheck = P(<path d="M5 12.5l4.5 4.5L19 7.5" />)
export const IconEdit = P(<><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M14 6l4 4" /></>)
export const IconTrash = P(<><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></>)
export const IconSparkle = P(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" fill="currentColor" stroke="none" />)
export const IconDownload = P(<><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 19h14" /></>)
export const IconReplay = P(<><path d="M4 12a8 8 0 108-8H8" /><path d="M10 1L7 4l3 3" /></>)
export const IconCrown = P(<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" fill="currentColor" stroke="none" />)
export const IconHeart = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
    <path d="M12 21s-8-5.2-8-11a4.6 4.6 0 018-3.1A4.6 4.6 0 0120 10c0 5.8-8 11-8 11z" fill="currentColor" />
  </svg>
)
