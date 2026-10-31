export function numericHours(value:string){const match=value.match(/^([01]\d|2[0-3]):([0-5]\d)[–-]([01]\d|2[0-3]):([0-5]\d)$/);return match?`${match[1]}:${match[2]}–${match[3]}:${match[4]}`:null;}
