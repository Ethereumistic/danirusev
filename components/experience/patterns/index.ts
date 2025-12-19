// Pattern components export
export { TaxiCheckerPattern } from './TaxiCheckerPattern';
export { TyrePattern } from './TyrePattern';

// Pattern type definition
export type PatternType = 'taxi-checker' | 'tyre-pattern' | 'none';

// Pattern component map
import { TaxiCheckerPattern } from './TaxiCheckerPattern';
import { TyrePattern } from './TyrePattern';

export const PATTERN_COMPONENTS = {
    'taxi-checker': TaxiCheckerPattern,
    'tyre-pattern': TyrePattern,
    'none': null,
} as const;
