import { 
  SegmentRoot, 
  SegmentButton 
} from "./_components/SegmentedControlAesthetics";

export interface SegmentOption {
  id: string;
  label?: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  activeId: string;
  onChange: (id: string) => void;
  fullWidth?: boolean;
}

/**
 * SegmentedControl — Compact pill-style toggle for switching views.
 * Strictly follows SOP v5.6.0 with isolated aesthetics and Zero ClassName.
 * Design inspired by the premium "Floating White" look of FilterTabs.
 */
export function SegmentedControl({
  options,
  activeId,
  onChange,
  fullWidth,
}: SegmentedControlProps) {
  return (
    <SegmentRoot fullWidth={fullWidth}>
      {options.map((opt) => (
        <SegmentButton
          key={opt.id}
          isActive={activeId === opt.id}
          onClick={() => onChange(opt.id)}
        >
          {opt.icon || opt.label}
        </SegmentButton>
      ))}
    </SegmentRoot>
  );
}
