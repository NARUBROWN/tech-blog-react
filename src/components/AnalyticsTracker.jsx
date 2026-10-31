import { useLayoutEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { startPageTracking } from '../utils/analytics';

export default function AnalyticsTracker() {
    const { pathname, key } = useLocation();
    const visit = useMemo(() => ({ path: pathname, entry: key, id: crypto.randomUUID() }), [pathname, key]);
    useLayoutEffect(() => startPageTracking(visit.path, visit.id), [visit]);
    return null;
}
