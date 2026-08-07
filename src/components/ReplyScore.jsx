function clampScore(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(Math.round(number), 100));
}

function Metric({ label, value = 0, risk = false }) {
  const score = clampScore(value);
  const displayScore = risk ? 100 - score : score;

  return (
    <div className="rf-v4-metric">
      <div>
        <span>{label}</span>
        <strong>{score}</strong>
      </div>

      <div className="rf-v4-metric-track">
        <span
          style={{
            width: `${risk ? score : displayScore}%`,
          }}
        />
      </div>
    </div>
  );
}

function RiskBadge({ label, value = 0 }) {
  const score = clampScore(value);

  const level =
    score >= 70
      ? "High risk"
      : score >= 35
        ? "Medium risk"
        : "Low risk";

  const symbol = score >= 70 ? "!" : score >= 35 ? "△" : "✓";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "8px",
        border: "1px solid var(--rf-v4-border)",
        borderRadius: "10px",
        background: "var(--rf-v4-surface-soft)",
        padding: "8px 9px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          minWidth: 0,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "grid",
            width: "21px",
            height: "21px",
            placeItems: "center",
            borderRadius: "7px",
            background:
              score >= 70
                ? "rgba(216, 74, 74, 0.1)"
                : score >= 35
                  ? "rgba(245, 158, 11, 0.11)"
                  : "rgba(39, 166, 107, 0.1)",
            color:
              score >= 70
                ? "var(--rf-v4-danger)"
                : score >= 35
                  ? "#b77900"
                  : "var(--rf-v4-green)",
            fontSize: "9px",
            fontWeight: 800,
          }}
        >
          {symbol}
        </span>

        <div
          style={{
            display: "flex",
            minWidth: 0,
            flexDirection: "column",
            gap: "1px",
          }}
        >
          <strong
            style={{
              fontSize: "8px",
              fontWeight: 700,
            }}
          >
            {label}
          </strong>

          <span
            style={{
              color: "var(--rf-v4-faint)",
              fontSize: "7px",
            }}
          >
            {level}
          </span>
        </div>
      </div>

      <strong
        style={{
          fontSize: "9px",
          color:
            score >= 70
              ? "var(--rf-v4-danger)"
              : score >= 35
                ? "#b77900"
                : "var(--rf-v4-green)",
        }}
      >
        {score}
      </strong>
    </div>
  );
}

function ReplyScore({
  replyScore,
  scoreLoading,
  analyzeReply,
  applyCoachFixes,
  coachFixLoading,
  coachFixError,
}) {
  const overall = clampScore(replyScore?.overall);
  const circumference = 201.06;
  const dashOffset =
    circumference - (overall / 100) * circumference;

  const verdict =
    replyScore?.verdict?.trim() ||
    (overall >= 85
      ? "This reply is clear, confident, and ready to send."
      : overall >= 70
        ? "This is a strong reply with a few possible improvements."
        : replyScore
          ? "This reply would benefit from refinement before sending."
          : "Generate a reply, then run a detailed communication check.");

  return (
    <section className="rf-v4-insight-card">
      <div className="rf-v4-insight-header">
        <div>
          <span className="rf-v4-eyebrow">
            AI Reply Coach
          </span>

          <h2>Communication check</h2>
        </div>

        <button
          type="button"
          onClick={analyzeReply}
          disabled={scoreLoading}
          className="rf-v4-analyze-button"
        >
          {scoreLoading ? "Coaching…" : "Analyze"}
        </button>
      </div>

      <div className="rf-v4-score-summary">
        <div className="rf-v4-score-ring">
          <svg
            viewBox="0 0 72 72"
            aria-hidden="true"
          >
            <circle
              className="rf-v4-score-track"
              cx="36"
              cy="36"
              r="32"
            />

            <circle
              className="rf-v4-score-progress"
              cx="36"
              cy="36"
              r="32"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>

          <div>
            <strong>{overall}</strong>
            <span>/100</span>
          </div>
        </div>

        <div>
          <strong>
            {!replyScore
              ? "Ready to coach"
              : overall >= 85
                ? "Excellent response"
                : overall >= 70
                  ? "Strong response"
                  : "Needs refinement"}
          </strong>

          <p>{verdict}</p>
        </div>
      </div>

      <div className="rf-v4-metrics">
        <Metric
          label="Grammar"
          value={replyScore?.grammar}
        />

        <Metric
          label="Clarity"
          value={replyScore?.clarity}
        />

        <Metric
          label="Professionalism"
          value={replyScore?.professionalism}
        />

        <Metric
          label="Politeness"
          value={replyScore?.politeness}
        />

        <Metric
          label="Confidence"
          value={replyScore?.confidence}
        />

        <Metric
          label="Empathy"
          value={replyScore?.empathy}
        />

        <Metric
          label="Readability"
          value={replyScore?.readability}
        />

        <Metric
          label="Call to action"
          value={replyScore?.callToAction}
        />
      </div>

      {replyScore && (
        <div
          style={{
            display: "grid",
            gap: "6px",
            marginTop: "13px",
          }}
        >
          <RiskBadge
            label="Aggressive tone"
            value={replyScore?.aggressiveRisk}
          />

          <RiskBadge
            label="Misunderstanding"
            value={replyScore?.misunderstandingRisk}
          />
        </div>
      )}

      {replyScore?.suggestions?.length > 0 && (
        <div className="rf-v4-suggestions">
          <div>
            <span>✦</span>
            Coach suggestions
          </div>

          <ul>
            {replyScore.suggestions
              .filter(Boolean)
              .slice(0, 5)
              .map((suggestion, index) => (
                <li key={`${suggestion}-${index}`}>
                  {suggestion}
                </li>
              ))}
          </ul>

          <button
            type="button"
            onClick={applyCoachFixes}
            disabled={coachFixLoading}
            className="rf-v4-analyze-button"
            style={{ marginTop: "9px", width: "100%" }}
          >
            {coachFixLoading ? "Improving…" : "Apply coach fixes"}
          </button>

          {coachFixError && (
            <p
              role="alert"
              style={{
                margin: "7px 0 0",
                color: "var(--rf-v4-danger)",
                fontSize: "8px",
                lineHeight: 1.45,
              }}
            >
              {coachFixError}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export default ReplyScore;
