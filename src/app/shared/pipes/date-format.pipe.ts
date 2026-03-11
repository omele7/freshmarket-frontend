import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(value: Date | string, format: 'short' | 'long' = 'short'): string {
    const date = typeof value === 'string' ? new Date(value) : value;

    const options: Intl.DateTimeFormatOptions =
      format === 'long'
        ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
        : { year: 'numeric', month: '2-digit', day: '2-digit' };

    return new Intl.DateTimeFormat('es-PE', options).format(date);
  }
}
