// Pattern components export
export { TaxiCheckerPattern } from './TaxiCheckerPattern';
export { TyrePattern } from './TyrePattern';
export { EventPattern } from './EventPattern';
export { DayPattern } from './DayPattern';
export { MixPattern } from './MixPattern';

// Pattern type definition
export type PatternType = 'taxi-checker' | 'tyre-pattern' | 'event' | 'day' | 'mix' | 'none';

// Pattern component map
import { TaxiCheckerPattern } from './TaxiCheckerPattern';
import { TyrePattern } from './TyrePattern';
import { EventPattern } from './EventPattern';
import { DayPattern } from './DayPattern';
import { MixPattern } from './MixPattern';

export const PATTERN_COMPONENTS = {
    'taxi-checker': TaxiCheckerPattern,
    'tyre-pattern': TyrePattern,
    'event': EventPattern,
    'day': DayPattern,
    'mix': MixPattern,
    'none': null,
} as const;
