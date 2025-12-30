// Pattern components export
export { TaxiCheckerPattern } from './TaxiCheckerPattern';
export { TyrePattern } from './TyrePattern';
export { EventPattern } from './EventPattern';

// Pattern type definition
export type PatternType = 'taxi-checker' | 'tyre-pattern' | 'event' | 'none';

// Pattern component map
import { TaxiCheckerPattern } from './TaxiCheckerPattern';
import { TyrePattern } from './TyrePattern';
import { EventPattern } from './EventPattern';

export const PATTERN_COMPONENTS = {
    'taxi-checker': TaxiCheckerPattern,
    'tyre-pattern': TyrePattern,
    'event': EventPattern,
    'none': null,
} as const;
