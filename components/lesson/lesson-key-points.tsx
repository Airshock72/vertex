import { CheckCircleIcon, LightbulbIcon } from "@/components/ui/icons";

interface LessonKeyPointsProps {
  keyPoints: string[] | null;
  proTip: string | null;
}

export function LessonKeyPoints({ keyPoints, proTip }: LessonKeyPointsProps) {
  const hasKeyPoints = keyPoints && keyPoints.length > 0;

  if (!hasKeyPoints && !proTip) return null;

  return (
    <div className="mt-2">
      {hasKeyPoints && (
        <div className="mt-6">
          <hr className="border-canvas-line mb-6" />
          <p className="text-[15px] font-semibold text-neutral-900 mb-4">
            In this lesson you will:
          </p>
          <ul className="space-y-3">
            {keyPoints!.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircleIcon
                  size={18}
                  className="shrink-0 text-primary-500 mt-0.5"
                  aria-hidden
                />
                <span className="text-[15px] text-neutral-700 leading-6">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {proTip && (
        <div className="mt-6 bg-primary-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <LightbulbIcon size={20} className="text-primary-500 shrink-0" aria-hidden />
            <span
              className="text-[16px] font-bold text-neutral-900"
              style={{ fontFamily: "var(--font-playfair-display)" }}
            >
              Pro Tip
            </span>
          </div>
          <p className="text-[15px] text-neutral-700 leading-6">{proTip}</p>
        </div>
      )}
    </div>
  );
}
