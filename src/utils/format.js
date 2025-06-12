import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
  } catch {
    return dateString.toString();
  }
};

export const formatEventDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return format(date, 'EEEE dd MMMM yyyy', { locale: fr });
  } catch {
    return dateString.toString();
  }
};

export const formatTimeValue = (value) => {
  if (!value) return '';
  if (typeof value === 'string') {
    if (/^\d{2}:\d{2}$/.test(value)) return value;
    const date = new Date(value);
    if (!isNaN(date)) return format(date, 'HH:mm', { locale: fr });
    return value;
  }
  if (value instanceof Date && !isNaN(value)) {
    return format(value, 'HH:mm', { locale: fr });
  }
  return '';
};

export const safeString = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return val.toString();
  if (val instanceof Date && !isNaN(val)) return format(val, 'dd/MM/yyyy HH:mm', { locale: fr });
  return val.toString ? val.toString() : '';
}; 