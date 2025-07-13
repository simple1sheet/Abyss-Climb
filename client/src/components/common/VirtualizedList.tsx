import React, { useMemo, useCallback, memo } from 'react';
import { useVirtualScroll } from '@/utils/performanceUtils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 3,
  onScroll,
  getItemKey = (_, index) => index
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const {
    visibleItems,
    offsetY,
    totalHeight,
    visibleStart
  } = useVirtualScroll(items, itemHeight, containerHeight, overscan);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  const itemsToRender = useMemo(() => {
    return visibleItems.map((item, index) => {
      const actualIndex = visibleStart + index;
      const key = getItemKey(item, actualIndex);
      
      return (
        <div
          key={key}
          style={{
            position: 'absolute',
            top: (visibleStart + index) * itemHeight,
            height: itemHeight,
            width: '100%'
          }}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [visibleItems, visibleStart, itemHeight, renderItem, getItemKey]);

  return (
    <div
      className={className}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {itemsToRender}
      </div>
    </div>
  );
}

export default memo(VirtualizedList) as typeof VirtualizedList;