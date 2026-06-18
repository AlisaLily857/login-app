import React from 'react';

interface SkeletonProps {
  type?: 'text' | 'avatar' | 'card' | 'list' | 'page';
  lines?: number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  type = 'text', 
  lines = 3,
  className = '' 
}) => {
  const baseClass = 'skeleton';

  if (type === 'page') {
    return (
      <div className={`${baseClass}-page ${className}`}>
        <div className={`${baseClass}-header`}>
          <div className={`${baseClass}-title`} />
        </div>
        <div className={`${baseClass}-content`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`${baseClass}-card`}>
              <div className={`${baseClass}-card-header`} />
              <div className={`${baseClass}-card-body`}>
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className={`${baseClass}-line`} style={{ width: `${100 - j * 20}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className={`${baseClass}-card ${className}`}>
        <div className={`${baseClass}-card-header`} />
        <div className={`${baseClass}-card-body`}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className={`${baseClass}-line`} style={{ width: `${100 - i * 15}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'avatar') {
    return <div className={`${baseClass}-avatar ${className}`} />;
  }

  if (type === 'list') {
    return (
      <div className={`${baseClass}-list ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`${baseClass}-list-item`}>
            <div className={`${baseClass}-avatar-small`} />
            <div className={`${baseClass}-list-content`}>
              <div className={`${baseClass}-line`} style={{ width: '60%' }} />
              <div className={`${baseClass}-line`} style={{ width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 默认文本骨架
  return (
    <div className={`${baseClass}-text ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`${baseClass}-line`} style={{ width: `${100 - i * 10}%` }} />
      ))}
    </div>
  );
};

export default Skeleton;