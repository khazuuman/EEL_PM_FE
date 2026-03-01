import {
	CalendarDate,
	getLocalTimeZone,
	parseAbsolute,
	parseDateTime
} from '@internationalized/date';
import { isValid, format, intervalToDuration, formatDuration } from 'date-fns';
import { vi } from 'date-fns/locale';

type DateFormatType = 'full' | 'date-only' | 'test-session-date' | 'hour-only';

export function isDate(value: any): boolean {
	if (!value) return false;
	const date = new Date(value);
	if (!isValid(date)) {
		return false;
	}
	return true;
}
export function formatIfDate(value: any, type: DateFormatType = 'full'): string {
	if (isDate(value)) {
		if (type === 'full') {
			return format(new Date(value), 'dd/MM/yyyy', { locale: vi });
		} else if (type === 'test-session-date') {
			return format(new Date(value), 'PPPP');
		} else if (type === 'hour-only') {
			return format(new Date(value), 'p');
		} else {
			return format(new Date(value + 'T00:00:00'), 'dd/MM/yyyy', { locale: vi });
		}
	}

	return value;
}

export function parseCalendarDateTimeString(
	dateTimeStr: string | Date | undefined | null
): { date: CalendarDate; time: string } | null {
	if (!dateTimeStr) return null;

	try {
		let dateObj: Date;

		if (dateTimeStr instanceof Date) {
			dateObj = dateTimeStr;
		} else {
			// Try parseAbsolute first for ISO strings with timezone
			if (
				typeof dateTimeStr === 'string' &&
				(dateTimeStr.includes('Z') || dateTimeStr.match(/[+-]\d{2}:\d{2}$/))
			) {
				try {
					const parsed = parseAbsolute(dateTimeStr, getLocalTimeZone());
					return {
						date: new CalendarDate(parsed.year, parsed.month, parsed.day),
						time: `${String(parsed.hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}`
					};
				} catch (e) {
					// Fallback to Date
					dateObj = new Date(dateTimeStr);
				}
			} else {
				// Standard Date parsing
				dateObj = new Date(dateTimeStr);
			}
		}

		if (isNaN(dateObj.getTime())) return null;

		return {
			date: new CalendarDate(dateObj.getFullYear(), dateObj.getMonth() + 1, dateObj.getDate()),
			time: `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`
		};
	} catch (error) {
		console.error('Parse error:', error);
		return null;
	}
}

export function formatDurationTime(targetDate: string): string {
	const now = new Date();
	const end = new Date(targetDate);

	if (!isValid(end) || end <= now) return '';

	const duration = intervalToDuration({ start: now, end });
	const { hours = 0, minutes = 0 } = duration;

	if (hours > 0) return `${hours}h ${minutes}min(s)`;
	return `${minutes}min(s)`;
}
