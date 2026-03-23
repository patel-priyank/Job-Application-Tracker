export const HEADER_HEIGHT = 60;

export const FOOTER_HEIGHT = 60.8 + 4 * 2;

export const APPLICATION_STATUS: Record<string, { label: string; color: string; default?: boolean }> = {
  REFERRED: {
    label: 'Referred',
    color: 'grape'
  },
  APPLIED: {
    label: 'Applied',
    color: 'violet',
    default: true
  },
  SCREENED: {
    label: 'Screened',
    color: 'indigo'
  },
  INTERVIEWED: {
    label: 'Interviewed',
    color: 'cyan'
  },
  OFFER_RECEIVED: {
    label: 'Offer Received',
    color: 'green'
  },
  OFFER_ACCEPTED: {
    label: 'Offer Accepted',
    color: 'lime'
  },
  OFFER_DECLINED: {
    label: 'Offer Declined',
    color: 'orange'
  },
  REJECTED: {
    label: 'Rejected',
    color: 'red'
  }
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-]).+$/;

export const PASSWORD_SPECIAL_CHARS_REGEX = /[$&+,:;=?@#|'<>.^*()%!-]/;

export const PASSWORD_REQUIREMENTS = [
  { re: /^.{8,128}$/, label: '8-128 characters' },
  { re: /[A-Z]/, label: 'Uppercase letter' },
  { re: /[a-z]/, label: 'Lowercase letter' },
  { re: /[0-9]/, label: 'Number' },
  { re: PASSWORD_SPECIAL_CHARS_REGEX, label: 'Special character' }
];

export const RESEND_COUNTDOWN = 60; // in seconds
