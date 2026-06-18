import React, { useState, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useInfiniteScroll = ({
  threshold = 100,
  onLoadMore,
  hasMore,
}: UseInfiniteScrollOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setIsLoading(true);
            await onLoadMore();
            setIsLoading(false);
          }
        },
        { rootMargin: `${threshold}px` }
      );

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore, threshold]
  );

  return { lastElementRef, isLoading };
};

// 虚拟列表 Hook
export const useVirtualList = <T extends any>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    startIndex,
    totalHeight,
    offsetY,
    onScroll,
  };
};

// 防抖 Hook
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

// 节流 Hook
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const lastRun = useRef(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
};

// 本地存储 Hook（带过期时间）
export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  expiry?: number // 毫秒
) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        if (expiry && parsed.timestamp && Date.now() - parsed.timestamp > expiry) {
          window.localStorage.removeItem(key);
          return initialValue;
        }
        return parsed.value;
      }
      return initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        const data = expiry
          ? { value: valueToStore, timestamp: Date.now() }
          : { value: valueToStore };
        window.localStorage.setItem(key, JSON.stringify(data));
        setStoredValue(valueToStore);
      } catch (error) {
        console.error('useLocalStorage error:', error);
      }
    },
    [key, storedValue, expiry]
  );

  const removeValue = useCallback(() => {
    window.localStorage.removeItem(key);
    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};

// 网络状态 Hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 获取连接类型
    const connection = (navigator as any).connection;
    if (connection) {
      setConnectionType(connection.effectiveType);
      connection.addEventListener('change', () => {
        setConnectionType(connection.effectiveType);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionType };
};

// 页面可见性 Hook
export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  React.useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};
