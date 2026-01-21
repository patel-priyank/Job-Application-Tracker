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
  INTERVIEW_PHONE: {
    label: 'Phone Interview',
    color: 'indigo'
  },
  INTERVIEW_IN_PERSON: {
    label: 'In Person Interview',
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

export const PW_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-]).+$/;

export const PW_SPECIAL_CHARS_REGEX = /[$&+,:;=?@#|'<>.^*()%!-]/;
