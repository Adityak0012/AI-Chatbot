import { useEffect, useRef } from 'react';

export const useAutoResizeTextArea = (value) => {
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (textAreaRef.current) {
      // Reset height to allow shrinking
      textAreaRef.current.style.height = '0px';
      const scrollHeight = textAreaRef.current.scrollHeight;
      
      // Max height to prevent it from growing too large
      const maxHeight = 200;
      textAreaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  return textAreaRef;
};
