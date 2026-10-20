import type { PropsWithChildren, ReactElement } from 'react';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({
  message,
  children,
}: PropsWithChildren<ErrorStateProps>): ReactElement {
  return (
    <div role="alert">
      <p>{message}</p>

      {children ? <div>{children}</div> : null}
    </div>
  );
}
