import { PAGE } from '@shared/config/page';

export const goBackHandler = () => {
  if (document.referrer && document.referrer.includes('jirum-alarm.com')) {
    history.back();
  } else {
    location.href = '/';
  }
};

export function detailPage(id: number): PAGE.DETAIL {
  return `/products/${id}` as PAGE.DETAIL;
}

export function detailCommentPage(id: number): PAGE.COMMENT {
  return `/products/${id}/comment` as PAGE.COMMENT;
}
