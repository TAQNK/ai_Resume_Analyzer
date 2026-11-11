type ScoreBadgeProps = {
  score: number;
};

const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  const badgeStyle =
    score > 69
      ? { label: "Strong", color: "bg-badge-green text-badge-green-text" }
      : score > 49
        ? { label: "Good Start", color: "bg-badge-yellow text-badge-yellow-text" }
        : { label: "Needs Word", color: "bg-badge-red text-badge-red-text" };

  return (
    <div className={`score-badge ${badgeStyle.color}`}>
      <p>{badgeStyle.label}</p>
    </div>
  );
};

export default ScoreBadge;