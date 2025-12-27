export const APPLICATION_STATUS: Record<string, { label: string; color: string; default?: boolean }> = {
  REFERRED: {
    label: 'Referred',
    color: 'gray'
  },
  APPLIED: {
    label: 'Applied',
    color: 'blue',
    default: true
  },
  INTERVIEW_PHONE: {
    label: 'Phone Interview',
    color: 'cyan'
  },
  OFFER_RECEIVED: {
    label: 'Offer Received',
    color: 'teal'
  },
  OFFER_ACCEPTED: {
    label: 'Offer Accepted',
    color: 'green'
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

export const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-]).+$/;

export const PW_SPECIAL_CHARS_REGEX = /[$&+,:;=?@#|'<>.^*()%!-]/;
