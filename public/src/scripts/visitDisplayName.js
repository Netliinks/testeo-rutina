// @ts-nocheck
/**
 * Returns the name to display for a visit.
 * RUC visits do not have personal-name fields, so their verified legal name
 * is used as the fallback.
 */
export const getVisitDisplayName = (visit) => {
    const personalName = [
        visit?.firstName,
        visit?.firstLastName,
        visit?.secondLastName,
    ]
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
        .join(' ');
    return personalName || String(visit?.legalName ?? '').trim();
};
