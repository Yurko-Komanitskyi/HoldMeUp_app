import * as React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import type { FlatList, ScrollView } from 'react-native';

type ScrollToTopTarget = ScrollView | FlatList<any> | null;

function scrollToTop(node: ScrollToTopTarget) {
  if (!node) return;
  const asList = node as FlatList<any>;
  asList.scrollToOffset?.({ offset: 0, animated: false });
  const asScroll = node as ScrollView;
  asScroll.scrollTo?.({ y: 0, animated: false });
}

/**
 * Повертає ref для ScrollView / FlatList: при фокусі екрана (таб / стек) прокрутка на початок.
 * Вкажіть дженерик: `useScrollToTopOnFocus<ScrollView>()` або `useScrollToTopOnFocus<FlatList<MyItem>>()`.
 */
export function useScrollToTopOnFocus<
  T extends ScrollView | FlatList<any> = ScrollView | FlatList<any>,
>(): React.RefObject<T | null> {
  const ref = React.useRef<T | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      requestAnimationFrame(() => {
        scrollToTop(ref.current as ScrollToTopTarget);
      });
    }, [])
  );

  return ref;
}
