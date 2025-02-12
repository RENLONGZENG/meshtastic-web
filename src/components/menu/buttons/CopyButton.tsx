import type React from 'react';

import { FiCheck, FiClipboard } from 'react-icons/fi';
import useCopyClipboard from 'react-use-clipboard';

import type { ButtonProps } from '@components/generic/button/Button';
import { IconButton } from '@components/generic/button/IconButton';

export interface CopyButtonProps extends ButtonProps {
  data: string;
}

export const CopyButton = ({
  data,
  ...props
}: CopyButtonProps): JSX.Element => {
  const [isCopied, setCopied] = useCopyClipboard(data, {
    successDuration: 1000,
  });

  return (
    <IconButton
      placeholder={``}
      onClick={(): void => {
        setCopied();
      }}
      icon={isCopied ? <FiCheck /> : <FiClipboard />}
      {...props}
    />
  );
};
