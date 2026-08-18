import { useMemo } from 'react';
import { usePolling } from '../hooks/usePolling';
import { useClock } from '../hooks/useClock';
import { useChangePulse } from '../hooks/useChangePulse';
import { getEtfs } from '../api/etfs';
import { friendlyMessage } from '../api/errorMessages';
import { buildScale, groupNumber, parseMoney } from '../lib/chartScale';
import { formatDecimal, formatPercentage, isZeroDecimal } from '../lib/money';
import { resolveMediaUrl } from '../lib/media';
import { buildTickerItems } from '../lib/ticker';
import Spinner from '../components/Spinner';
import ErrorBanner from '../components/ErrorBanner';
import ConnectionStatus from '../components/ConnectionStatus';
import type { Etf } from '../types/api';
import styles from './DashboardPage.module.css';

/** Camp screen: 10-15s is the sane poll window per the API's no-realtime note. */
const POLL_INTERVAL_MS = 12_000;

function trendClasses(trend: Etf['trend']) {
  if (trend === 'UP') return { bar: styles.barUp, change: styles.changeUp, icon: '▲' };
  if (trend === 'DOWN') return { bar: styles.barDown, change: styles.changeDown, icon: '▼' };
  return { bar: styles.barFlat, change: styles.changeFlat, icon: '■' };
}

/** Artboard badge is a single glyph; use the logo when the API supplies one. */
function EtfBadge({ etf }: { etf: Etf }) {
  const logo = resolveMediaUrl(etf.logo_url);
  const initials =
    etf.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('') || '?';

  return (
    <div className={styles.badge}>
      {logo ? (
        <img src={logo} alt="" className={styles.badgeImage} />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data: etfs, error, isLoading, lastUpdated, refresh } = usePolling(getEtfs, POLL_INTERVAL_MS);
  const clock = useClock();

  const pulseEntries = useMemo(
    () => (etfs ?? []).map((e) => ({ key: String(e.id), value: e.current_value })),
    [etfs],
  );
  const pulsed = useChangePulse(pulseEntries);

  const scale = useMemo(
    () => buildScale((etfs ?? []).map((e) => parseMoney(e.current_value))),
    [etfs],
  );

  const tickerItems = useMemo(() => buildTickerItems(etfs ?? []), [etfs]);

  // First load, nothing to show yet.
  if (isLoading && !etfs && !error) {
    return (
      <div className={styles.centerPage}>
        <Spinner />
      </div>
    );
  }

  // First load failed outright — there is no last-good data to preserve.
  if (error && !etfs) {
    return (
      <div className={styles.centerPage}>
        <ErrorBanner message={friendlyMessage(error)} onRetry={refresh} />
      </div>
    );
  }

  const list = etfs ?? [];
  // Currency is echoed by the API; never hardcoded.
  const currency = list[0]?.currency ?? '';

  return (
    <div className={styles.viewport}>
      <div className={styles.stage}>
        <div className={styles.frame}>

          <header className={styles.header}>
            <div className={styles.brand}>
              <svg viewBox="0 0 100 44" className={styles.logo} aria-hidden="true">
                <polyline
                  points="4,40 26,26 44,32 86,7"
                  fill="none"
                  stroke="var(--color-green)"
                  strokeWidth="7.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polygon points="97,3 76,3 97,24" fill="var(--color-green)" />
              </svg>
              <div className={styles.wordmark}>easy money</div>
            </div>

            <div className={styles.headerRight}>
              <div className={styles.clock}>{clock}</div>
              <ConnectionStatus error={error} lastUpdated={lastUpdated} variant="projector" />
            </div>
          </header>

          <div className={styles.rule} />

          <div className={styles.chart}>
            <div className={styles.axis}>
              <div className={styles.axisCurrency}>{currency}</div>
              {scale.ticks.map((tick) => (
                <div
                  key={tick}
                  className={styles.axisLabel}
                  style={{ bottom: `${scale.percentFor(tick)}%` }}
                >
                  {groupNumber(tick)}
                </div>
              ))}
            </div>

            <div className={styles.plot}>
              {scale.ticks.map((tick) => (
                <div
                  key={tick}
                  className={styles.gridline}
                  style={{ bottom: `${scale.percentFor(tick)}%` }}
                />
              ))}
              <div className={styles.baseline} />

              <div className={styles.bars}>
                {list.map((etf, index) => {
                  const percent = scale.percentFor(parseMoney(etf.current_value));
                  const { bar } = trendClasses(etf.trend);
                  const didPulse = pulsed.has(String(etf.id));

                  return (
                    <div key={etf.id} className={styles.barSlot}>
                      <div
                        className={styles.barValue}
                        style={{
                          bottom: `calc(${percent.toFixed(2)}% + 1cqw)`,
                          animationDelay: `${0.55 + index * 0.07}s`,
                        }}
                      >
                        <span
                          // Remounting on value change replays the pop keyframe.
                          key={etf.current_value}
                          className={`${styles.barValueNumber} ${didPulse ? styles.barValuePop : ''}`}
                        >
                          {formatDecimal(etf.current_value)}
                        </span>
                        <span className={styles.barValueCurrency}> {etf.currency}</span>
                      </div>
                      <div
                        className={`${styles.bar} ${bar}`}
                        style={{
                          height: `${percent.toFixed(2)}%`,
                          animationDelay: `${index * 0.07}s`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.legend}>
            <div />
            <div className={styles.legendItems}>
              {list.map((etf) => {
                const { change, icon } = trendClasses(etf.trend);
                const flat = etf.trend === 'FLAT' || isZeroDecimal(etf.last_change_percentage);

                return (
                  <div key={etf.id} className={styles.legendItem}>
                    <EtfBadge etf={etf} />
                    <div className={styles.legendName} title={etf.name}>{etf.name}</div>
                    <div className={`${styles.legendChange} ${change}`}>
                      <span className={styles.legendChangeIcon} aria-hidden="true">{icon}</span>
                      <span>
                        {flat ? '0.00%' : formatPercentage(etf.last_change_percentage)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.ticker}>
            <div className={styles.tickerLabel}>
              <span className={styles.tickerDot} />
              <span className={styles.tickerLabelText}>أخبار السوق</span>
            </div>
            <div className={styles.tickerViewport}>
              <div className={styles.tickerTrack} dir="rtl">
                {[0, 1].map((run) => (
                  <div
                    key={run}
                    className={styles.tickerRun}
                    aria-hidden={run === 1 ? true : undefined}
                  >
                    {tickerItems.map((item, i) => (
                      <span key={`${item.id}-${i}`}>
                        <span>{item.prefix}</span>
                        {item.strong && <span className={styles.tickerStrong}>{item.strong}</span>}
                        <span>{item.suffix}</span>
                        <span className={styles.tickerSep}> ◆ </span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
