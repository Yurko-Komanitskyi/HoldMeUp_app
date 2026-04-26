import { AscentFeelingBlock } from '@/entities/ascent/ui/ascent-feeling-block';

interface Props {
  feeling: string | null;
  cardBg: string;
  borderColor: string;
  onChange: (value: string | null) => void;
}

export function FeelingSection({ feeling, cardBg, borderColor, onChange }: Props) {
  return (
    <AscentFeelingBlock
      mode="select"
      feeling={feeling}
      cardBg={cardBg}
      borderColor={borderColor}
      onChange={onChange}
    />
  );
}
