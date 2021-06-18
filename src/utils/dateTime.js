import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const getTime = ({ seconds }) => dayjs.unix(seconds).format('HH:mm');

const getLastSeen = ({ seconds }, explicit = false) => explicit ?
    (dayjs.unix(seconds).isToday() ?
        ('today at ' + getTime({ seconds })) :
        dayjs.unix(seconds).isYesterday() ?
            ('yesterday at ' + getTime({ seconds })) :
            dayjs.unix(seconds).format('DD-MM-YYYY')) :
    dayjs.unix(seconds).fromNow();


export { getTime, getLastSeen };