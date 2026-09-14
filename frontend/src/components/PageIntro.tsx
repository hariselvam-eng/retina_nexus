import type { ReactNode } from 'react';

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-intro">
      <div className="page-intro-copy">
        {eyebrow && (
          <div className="page-eyebrow">
            <span className="page-eyebrow-dot" />
            {eyebrow}
          </div>
        )}

        <h2 className="page-title">
          {title}
        </h2>

        {description && (
          <p className="page-description">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="page-actions">
          {action}
        </div>
      )}
    </div>
  );
}