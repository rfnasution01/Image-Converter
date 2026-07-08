import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export function formatDate(value?: string | Date | null, format = 'DD MMMM YYYY') {
  if (!value) return '';
  return dayjs(value).format(format);
}

export { dayjs };
