import * as React from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import {
  useFollowMutations,
  useFollowSearchQuery,
  useFollowSuggestionsQuery,
  useFollowersByFollowerIdQuery,
  useFollowingByFollowingIdQuery,
} from '@/entities/follow/model/followHooks';
import { followKeys } from '@/entities/follow/api/followApi';
import type { Follow, UserWithFollowStatus } from '@/entities/follow/api/types';
import type { User } from '@/shared/model/types';
import { useUserStore } from '@/entities/user/model/userStore';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { useScrollToTopOnFocus } from '@/shared/hooks/use-scroll-to-top-on-focus';
import { Input } from '@/shared/ui/input';
import { Text } from '@/shared/ui/text';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

type Segment = 'search' | 'following' | 'followers';

function userDisplayName(user: User, t: (k: string) => string): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (name) return name;
  if (user.userTag) return `@${user.userTag}`;
  return user.email ?? t('common.unknown');
}

function userInitials(user: User): string {
  const parts = [user.firstName, user.lastName].filter(Boolean);
  if (parts.length >= 2) {
    return `${String(parts[0])[0] ?? ''}${String(parts[1])[0] ?? ''}`.toUpperCase();
  }
  if (parts.length === 1) return String(parts[0]).slice(0, 2).toUpperCase();
  if (user.userTag) return user.userTag.slice(0, 2).toUpperCase();
  return '?';
}

function UserAvatar({ user, size = 44 }: { user: User; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: ACCENT + '22',
        borderWidth: 2,
        borderColor: ACCENT + '44',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ fontSize: size * 0.36, fontWeight: '800', color: ACCENT }}>
        {userInitials(user)}
      </Text>
    </View>
  );
}

export default function CommunityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();
  const queryClient = useQueryClient();
  const currentUser = useUserStore((s) => s.currentUser);
  const myId = currentUser?.id ?? '';

  const goProfile = React.useCallback(
    (id: string) => {
      if (!id) return;
      if (id === myId) {
        router.push('/(tabs)/profile' as never);
        return;
      }
      router.push(`/user/${id}` as never);
    },
    [myId, router]
  );

  const [segment, setSegment] = React.useState<Segment>('search');
  // Один ref на три сегменти з різними item-типами — потрібен «широкий» FlatList.
  const communityListRef = useScrollToTopOnFocus<FlatList<any>>();
  const [searchText, setSearchText] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  React.useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchText.trim()), 400);
    return () => clearTimeout(id);
  }, [searchText]);

  const searchQuery = useFollowSearchQuery(debouncedSearch);
  const suggestionsQuery = useFollowSuggestionsQuery(segment === 'search' && debouncedSearch.length === 0);
  const followingQuery = useFollowersByFollowerIdQuery(myId);
  const followersQuery = useFollowingByFollowingIdQuery(myId);

  const { followMutation, unfollowMutation } = useFollowMutations();

  const activeFollowing = segment === 'following';
  const activeFollowers = segment === 'followers';

  const listQuery = activeFollowing ? followingQuery : activeFollowers ? followersQuery : null;

  const onRefresh = React.useCallback(() => {
    void (async () => {
      await queryClient.invalidateQueries({ queryKey: followKeys.all });
      await queryClient.refetchQueries({ queryKey: followKeys.all, type: 'active' });
      if (segment === 'search') {
        if (debouncedSearch.length > 0) await searchQuery.refetch();
        else await suggestionsQuery.refetch();
      }
      else if (activeFollowing) await followingQuery.refetch();
      else if (activeFollowers) await followersQuery.refetch();
    })();
  }, [
    queryClient,
    segment,
    activeFollowing,
    activeFollowers,
    debouncedSearch.length,
    searchQuery,
    suggestionsQuery,
    followingQuery,
    followersQuery,
  ]);

  const renderSearchItem = React.useCallback(
    ({ item }: { item: UserWithFollowStatus }) => {
      const busy = followMutation.isPending && followMutation.variables?.followingId === item.id;
      const busyUn =
        unfollowMutation.isPending && unfollowMutation.variables?.followingId === item.id;

      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 12,
          }}>
          <Pressable
            onPress={() => goProfile(item.id)}
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center', gap: 12, minWidth: 0 }}>
            <UserAvatar user={item} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                {userDisplayName(item, t)}
              </Text>
              {item.userTag ? (
                <Text numberOfLines={1} style={{ fontSize: 13, color: colors.mutedForeground }}>
                  @{item.userTag}
                </Text>
              ) : null}
            </View>
          </Pressable>
          <Pressable
            disabled={busy || busyUn}
            onPress={() =>
              item.isFollowedByMe
                ? unfollowMutation.mutate({ followingId: item.id })
                : followMutation.mutate({ followingId: item.id })
            }
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: item.isFollowedByMe ? colors.muted : ACCENT,
            }}>
            {busy || busyUn ? (
              <ActivityIndicator
                size="small"
                color={item.isFollowedByMe ? colors.foreground : '#fff'}
              />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: item.isFollowedByMe ? colors.foreground : '#fff',
                }}>
                {item.isFollowedByMe ? t('community.following') : t('community.follow')}
              </Text>
            )}
          </Pressable>
        </View>
      );
    },
    [
      colors.border,
      colors.foreground,
      colors.muted,
      colors.mutedForeground,
      followMutation,
      unfollowMutation,
      goProfile,
      t,
    ]
  );

  const renderFollowRow = React.useCallback(
    ({ item }: { item: Follow }) => {
      const other: User = activeFollowing ? item.following : item.follower;

      const busy =
        unfollowMutation.isPending &&
        activeFollowing &&
        unfollowMutation.variables?.followingId === other.id;
      const busyFollow =
        followMutation.isPending &&
        activeFollowers &&
        followMutation.variables?.followingId === other.id;

      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 12,
          }}>
          <Pressable
            onPress={() => goProfile(other.id)}
            style={{ flexDirection: 'row', flex: 1, alignItems: 'center', gap: 12, minWidth: 0 }}>
            <UserAvatar user={other} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                {userDisplayName(other, t)}
              </Text>
              {other.userTag ? (
                <Text numberOfLines={1} style={{ fontSize: 13, color: colors.mutedForeground }}>
                  @{other.userTag}
                </Text>
              ) : null}
            </View>
          </Pressable>
          {activeFollowing ? (
            <Pressable
              disabled={busy}
              onPress={() => unfollowMutation.mutate({ followingId: other.id })}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
              {busy ? (
                <ActivityIndicator size="small" color={colors.foreground} />
              ) : (
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                  {t('community.unfollow')}
                </Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              disabled={busyFollow}
              onPress={() => followMutation.mutate({ followingId: other.id })}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: ACCENT,
              }}>
              {busyFollow ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                  {t('community.follow')}
                </Text>
              )}
            </Pressable>
          )}
        </View>
      );
    },
    [
      activeFollowing,
      activeFollowers,
      colors.border,
      colors.foreground,
      colors.mutedForeground,
      followMutation,
      unfollowMutation,
      goProfile,
      t,
    ]
  );

  const segments: { key: Segment; label: string }[] = [
    { key: 'search', label: t('community.tabSearch') },
    { key: 'following', label: t('community.tabFollowing') },
    { key: 'followers', label: t('community.tabFollowers') },
  ];

  const searchItems = searchQuery.items.filter((u) => u.id !== myId);
  const suggestionItems = suggestionsQuery.items.filter((u) => u.id !== myId);
  const followingItems = followingQuery.items.filter((f) => f.following.id !== myId);
  const followersItems = followersQuery.items.filter((f) => f.follower.id !== myId);

  const showSearchNoResults =
    segment === 'search' &&
    debouncedSearch.length > 0 &&
    searchQuery.isSuccess &&
    searchItems.length === 0 &&
    !searchQuery.isFetching;
  const showSuggestionsEmpty =
    segment === 'search' &&
    debouncedSearch.length === 0 &&
    suggestionsQuery.isSuccess &&
    suggestionItems.length === 0 &&
    !suggestionsQuery.isFetching;

  const searchListQuery = debouncedSearch.length > 0 ? searchQuery : suggestionsQuery;
  const searchListItems = debouncedSearch.length > 0 ? searchItems : suggestionItems;
  const listError = segment === 'search' ? searchListQuery.error : (listQuery?.error ?? null);
  const listRefetching =
    segment === 'search' ? searchListQuery.isRefetching : (listQuery?.isRefetching ?? false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 16 }}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <Text
          style={{ fontSize: 22, fontWeight: '800', color: colors.foreground, marginBottom: 14 }}>
          {t('community.title')}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            borderRadius: 12,
            padding: 4,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          {segments.map(({ key, label }) => {
            const active = segment === key;
            return (
              <Pressable
                key={key}
                onPress={() => setSegment(key)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: active ? ACCENT + '28' : 'transparent',
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: '700',
                    color: active ? ACCENT : colors.mutedForeground,
                  }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {segment === 'search' ? (
          <Input
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('community.searchPlaceholder')}
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ marginTop: 14 }}
          />
        ) : null}
      </View>

      {listError ? (
        <QueryErrorPanel error={listError} onRetry={onRefresh} />
      ) : segment === 'search' ? (
        showSuggestionsEmpty ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center' }}>
              {t('community.noSuggestions')}
            </Text>
          </View>
        ) : showSearchNoResults ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center' }}>
              {t('community.noSearchResults')}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={communityListRef}
            data={searchListItems}
            keyExtractor={(u) => u.id}
            renderItem={renderSearchItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            onEndReached={() => searchListQuery.loadMore()}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={listRefetching}
                onRefresh={onRefresh}
                tintColor={ACCENT}
              />
            }
            ListFooterComponent={
              searchListQuery.isFetchingNextPage ? (
                <View style={{ paddingVertical: 16 }}>
                  <ActivityIndicator color={ACCENT} />
                </View>
              ) : null
            }
            ListHeaderComponent={
              searchListQuery.isFetching && searchListItems.length === 0 ? (
                <View style={{ paddingVertical: 24 }}>
                  <ActivityIndicator color={ACCENT} />
                </View>
              ) : null
            }
          />
        )
      ) : activeFollowing ? (
        followingQuery.isLoading && followingItems.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : followingQuery.isEmpty ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center' }}>
              {t('community.noFollowing')}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={communityListRef}
            data={followingItems}
            keyExtractor={(f) => f.id}
            renderItem={renderFollowRow}
            contentContainerStyle={{ paddingBottom: 100 }}
            onEndReached={() => followingQuery.loadMore()}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={listRefetching}
                onRefresh={onRefresh}
                tintColor={ACCENT}
              />
            }
            ListFooterComponent={
              followingQuery.isFetchingNextPage ? (
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                    {t('community.loadMore')}
                  </Text>
                </View>
              ) : null
            }
          />
        )
      ) : activeFollowers ? (
        followersQuery.isLoading && followersItems.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : followersQuery.isEmpty ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center' }}>
              {t('community.noFollowers')}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={communityListRef}
            data={followersItems}
            keyExtractor={(f) => f.id}
            renderItem={renderFollowRow}
            contentContainerStyle={{ paddingBottom: 100 }}
            onEndReached={() => followersQuery.loadMore()}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={listRefetching}
                onRefresh={onRefresh}
                tintColor={ACCENT}
              />
            }
            ListFooterComponent={
              followersQuery.isFetchingNextPage ? (
                <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                    {t('community.loadMore')}
                  </Text>
                </View>
              ) : null
            }
          />
        )
      ) : null}
    </View>
  );
}
