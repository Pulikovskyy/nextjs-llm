import React, { useState, Children, cloneElement, ReactNode, HTMLAttributes } from 'react';

interface TooltipProps {
  text: string;
  children?: ReactNode;
  [key: string]: any; // Allow other props to be passed through
}

// Extend HTMLAttributes to include mouse event handlers
interface EnhancedHTMLAttributes<T> extends HTMLAttributes<T> {
  onMouseEnter?: React.MouseEventHandler<T>;
  onMouseLeave?: React.MouseEventHandler<T>;
}

function Tooltip({ text, children, ...props }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  let clonedChild: ReactNode | null = null;

  // Check if children exist and is a single element
  if (children) {
    try {
      const child = Children.only(children) as React.ReactElement<EnhancedHTMLAttributes<any>>; // Type assertion here

      clonedChild = cloneElement(child, {
        ...props,
        onMouseEnter: () => setIsVisible(true),
        onMouseLeave: () => setIsVisible(false),
      });
    } catch (error) {
      console.error("Tooltip: Expected a single child element.  Received:", children);
      return null; // Or render a placeholder, or throw, depending on your needs
    }
  } else {
    return null; // Or a placeholder if no children are provided
  }


  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {clonedChild}
      {isVisible && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1,
            backgroundColor: '#ffc421',
            color: 'white',
            padding: '5px',
            borderRadius: '5px',
            bottom: '100%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

export default Tooltip;