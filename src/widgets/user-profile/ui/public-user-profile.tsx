import * as React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import {
  useFollowMutations,
  useFollowersByFollowerIdQuery,
  useFollowingByFollowingIdQuery,
  useUserByTagQuery,
} from '@/entities/follow/model/followHooks';
import { followKeys } from '@/entities/follow/api/followApi';
import type { Follow } from '@/entities/follow/api/types';
import type { User } from '@/shared/model/types';
import { useUserStore } from '@/entities/user/model/userStore';
import { useUserDetailsQuery } from '@/entities/user/model/userHooks';
import { useAscentsQuery } from '@/entities/ascent/model/ascentHooks';
import { userKeys } from '@/entities/user/api/userApi';
import { ascentKeys } from '@/entities/ascent/api/ascentApi';
import { ProfileAscentTile } from '@/widgets/profile/ui/profile-widget';
import { ACCENT } from '@/shared/config/palette';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import { Text } from '@/shared/ui/text';
import { QueryErrorPanel } from '@/shared/ui/query-error-panel';

type Segment = 'overview' | 'followers' | 'following';

const GRID_GAP = 8;

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

export function PublicUserProfile() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColor();
  const queryClient = useQueryClient();
  const { width: windowWidth } = useWindowDimensions();
  const params = useLocalSearchParams<{ userId: string | string[] }>();
  const userId = React.useMemo(() => {
    const p = params.userId;
    if (Array.isArray(p)) return p[0] ?? '';
    return typeof p === 'string' ? p : '';
  }, [params.userId]);
  const myId = useUserStore((s) => s.currentUser?.id);
  const isMe = !!(myId && userId && myId === userId);

  const [segment, setSegment] = React.useState<Segment>('overview');
  const [localFollowed, setLocalFollowed] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (isMe) {
      router.replace('/(tabs)/profile' as never);
    }
  }, [isMe, router]);

  const {
    data: user,
    isLoading: userLoading,
    isRefetching: userRefetching,
    error: userError,
    refetch: refetchUser,
  } = useUserDetailsQuery(userId);

  const followByTag = useUserByTagQuery(user?.userTag ?? '');

  const followersQuery = useFollowingByFollowingIdQuery(userId);
  const followingQuery = useFollowersByFollowerIdQuery(userId);
  const ascentsQuery = useAscentsQuery(
    { userId },
    { enabled: !!userId && !isMe }
  );

  const { followMutation, unfollowMutation } = useFollowMutations();

  React.useEffect(() => {
    if (user?.userTag) setLocalFollowed(null);
  }, [user?.userTag, userId]);

  const isFollowedByMe = React.useMemo(() => {
    if (!user || isMe) return false;
    const isFollowingFromFollowersList = !!(
      myId && followersQuery.items.some((f) => f.follower?.id === myId)
    );
    if (user.userTag) {
      if (typeof followByTag.data?.isFollowedByMe === 'boolean') return followByTag.data.isFollowedByMe;
      if (followByTag.isLoading) return isFollowingFromFollowersList;
      return isFollowingFromFollowersList;
    }
    if (localFollowed != null) return localFollowed;
    return isFollowingFromFollowersList;
  }, [
    user,
    isMe,
    myId,
    followersQuery.items,
    followByTag.data?.isFollowedByMe,
    followByTag.isLoading,
    localFollowed,
  ]);

  const followBusy =
    followMutation.isPending && followMutation.variables?.followingId === userId;
  const unfollowBusy =
    unfollowMutation.isPending && unfollowMutation.variables?.followingId === userId;

  const goProfile = React.useCallback(
    (id: string) => {
      if (!id) return;
      if (myId && id === myId) {
        router.replace('/(tabs)/profile' as never);
        return;
      }
      router.push(`/user/${id}` as never);
    },
    [myId, router]
  );

  const onRefresh = React.useCallback(() => {
    void (async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) }),
        queryClient.invalidateQueries({ queryKey: followKeys.all }),
        queryClient.invalidateQueries({ queryKey: ascentKeys.lists() }),
      ]);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: userKeys.detail(userId), type: 'active' }),
        queryClient.refetchQueries({ queryKey: followKeys.all, type: 'active' }),
        queryClient.refetchQueries({ queryKey: ascentKeys.lists(), type: 'active' }),
      ]);
      await refetchUser();
      await followersQuery.refetch();
      await followingQuery.refetch();
      await ascentsQuery.refetch();
      if (user?.userTag) await followByTag.refetch();
    })();
  }, [
    queryClient,
    userId,
    refetchUser,
    followersQuery,
    followingQuery,
    ascentsQuery,
    followByTag,
    user?.userTag,
  ]);

  const horizontalPad = 16;
  const gridWidth = windowWidth - horizontalPad * 2;
  const tileSize = Math.floor((gridWidth - GRID_GAP * 2) / 3);
  const tileHeight = tileSize * 0.7;

  const segments: { key: Segment; label: string }[] = [
    { key: 'overview', label: t('userProfile.tabOverview') },
    { key: 'followers', label: t('userProfile.tabFollowers') },
    { key: 'following', label: t('userProfile.tabFollowing') },
  ];

  const renderFollowListRow = React.useCallback(
    (other: User, variant: 'followers' | 'following') => {
      const busyUn =
        unfollowMutation.isPending && unfollowMutation.variables?.followingId === other.id;
      const busyF = followMutation.isPending && followMutation.variables?.followingId === other.id;

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
          {variant === 'following' ? (
            <Pressable
              disabled={busyUn}
              onPress={() => unfollowMutation.mutate({ followingId: other.id })}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
              }}>
              {busyUn ? (
                <ActivityIndicator size="small" color={colors.foreground} />
              ) : (
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
                  {t('community.unfollow')}
                </Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              disabled={busyF}
              onPress={() => followMutation.mutate({ followingId: other.id })}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: ACCENT,
              }}>
              {busyF ? (
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
      colors.border,
      colors.foreground,
      colors.mutedForeground,
      followMutation,
      unfollowMutation,
      goProfile,
      t,
    ]
  );

  if (!userId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ padding: 16 }}>
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ChevronLeft size={28} color={colors.foreground} />
            <Text style={{ fontSize: 16, color: colors.foreground }}>{t('common.back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isMe) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={ACCENT} />
        </View>
      </SafeAreaView>
    );
  }

  if (userError && !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ padding: 16 }}>
          <QueryErrorPanel error={userError} onRetry={() => void refetchUser()} />
        </View>
      </SafeAreaView>
    );
  }

  if (userLoading && !user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  const followersItems = followersQuery.items;
  const followingItems = followingQuery.items;

  const followerCountLabel = `${followersQuery.items.length}${
    followersQuery.hasNextPage ? '+' : ''
  }`;
  const followingCountLabel = `${followingQuery.items.length}${
    followingQuery.hasNextPage ? '+' : ''
  }`;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 4,
          paddingBottom: 10,
          minHeight: 44,
        }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ChevronLeft size={28} color={colors.foreground} />
        </Pressable>
        <Text
          style={{
            flex: 1,
            fontSize: 18,
            fontWeight: '700',
            color: colors.foreground,
            textAlign: 'center',
            marginRight: 44,
          }}
          numberOfLines={1}>
          {userDisplayName(user, t)}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
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
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: active ? ACCENT + '28' : 'transparent',
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: '700',
                    color: active ? ACCENT : colors.mutedForeground,
                  }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {segment === 'overview' ? (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={
                !!(
                  userRefetching ||
                  followByTag.isRefetching ||
                  followersQuery.isRefetching ||
                  followingQuery.isRefetching ||
                  ascentsQuery.isRefetching
                )
              }
              onRefresh={onRefresh}
              tintColor={ACCENT}
            />
          }>
          <View className="items-center gap-3 pt-1">
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: ACCENT + '18',
                borderWidth: 3,
                borderColor: ACCENT + '55',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 34, fontWeight: '800', color: ACCENT, lineHeight: 40 }}>
                {userInitials(user)}
              </Text>
            </View>
            <View className="items-center gap-1">
              <Text className="text-center text-2xl font-bold text-foreground">
                {userDisplayName(user, t)}
              </Text>
              {user.userTag ? (
                <Text className="text-sm font-medium text-muted-foreground">@{user.userTag}</Text>
              ) : null}
            </View>
          </View>

          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Pressable
              disabled={
                followBusy ||
                unfollowBusy ||
                (user.userTag ? followByTag.isLoading : false)
              }
              onPress={() => {
                if (isFollowedByMe) {
                  unfollowMutation.mutate(
                    { followingId: user.id },
                    {
                      onSuccess: () => {
                        setLocalFollowed(false);
                        void followByTag.refetch();
                      },
                    }
                  );
                } else {
                  followMutation.mutate(
                    { followingId: user.id },
                    {
                      onSuccess: () => {
                        setLocalFollowed(true);
                        void followByTag.refetch();
                      },
                    }
                  );
                }
              }}
              style={{
                paddingHorizontal: 28,
                paddingVertical: 12,
                borderRadius: 999,
                backgroundColor: isFollowedByMe ? colors.muted : ACCENT,
                minWidth: 160,
                alignItems: 'center',
              }}>
              {followBusy || unfollowBusy || (user.userTag && followByTag.isLoading) ? (
                <ActivityIndicator color={isFollowedByMe ? colors.foreground : '#fff'} />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: isFollowedByMe ? colors.foreground : '#fff',
                  }}>
                  {isFollowedByMe ? t('community.following') : t('community.follow')}
                </Text>
              )}
            </Pressable>
          </View>

          <Text
            style={{
              marginTop: 20,
              fontSize: 14,
              color: colors.mutedForeground,
              textAlign: 'center',
              lineHeight: 20,
            }}>
            {t('userProfile.countsHint')}
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <Pressable
              onPress={() => setSegment('followers')}
              style={{
                flex: 1,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                paddingVertical: 14,
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground }}>
                {followerCountLabel}
              </Text>
              <Text style={{ marginTop: 4, fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>
                {t('userProfile.tabFollowers')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSegment('following')}
              style={{
                flex: 1,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                paddingVertical: 14,
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.foreground }}>
                {followingCountLabel}
              </Text>
              <Text style={{ marginTop: 4, fontSize: 12, fontWeight: '600', color: colors.mutedForeground }}>
                {t('userProfile.tabFollowing')}
              </Text>
            </Pressable>
          </View>

          <View style={{ marginTop: 28, marginBottom: 10 }}>
            <Text className="text-base font-bold text-foreground">{t('profile.ascentsSection')}</Text>
          </View>

          {ascentsQuery.error && ascentsQuery.items.length === 0 ? (
            <QueryErrorPanel
              variant="compact"
              error={ascentsQuery.error}
              onRetry={() => void ascentsQuery.refetch()}
            />
          ) : ascentsQuery.isLoading && ascentsQuery.items.length === 0 ? (
            <View style={{ paddingVertical: 28, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={ACCENT} />
            </View>
          ) : ascentsQuery.isEmpty ? (
            <Text
              style={{
                fontSize: 15,
                color: colors.mutedForeground,
                textAlign: 'center',
                paddingVertical: 16,
              }}>
              {t('userProfile.noAscents')}
            </Text>
          ) : (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: GRID_GAP,
                  justifyContent: 'flex-start',
                }}>
                {ascentsQuery.items.map((a) => (
                  <ProfileAscentTile
                    key={a.id}
                    ascentId={a.id}
                    width={tileSize}
                    height={tileHeight}
                    routeName={a.routeName?.trim() ?? null}
                    routeGrade={a.routeGrade ?? null}
                    routeColor={a.routeColor ?? null}
                    success={a.success}
                    reactions={a.reactions ?? []}
                  />
                ))}
              </View>
              {ascentsQuery.hasNextPage ? (
                <Pressable
                  onPress={() => ascentsQuery.loadMore()}
                  style={{ marginTop: 16, alignItems: 'center', paddingVertical: 12 }}>
                  {ascentsQuery.isFetchingNextPage ? (
                    <ActivityIndicator color={ACCENT} />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: '600', color: ACCENT }}>
                      {t('community.loadMore')}
                    </Text>
                  )}
                </Pressable>
              ) : null}
            </>
          )}
        </ScrollView>
      ) : segment === 'followers' ? (
        followersQuery.error ? (
          <QueryErrorPanel error={followersQuery.error} onRetry={() => void followersQuery.refetch()} />
        ) : followersQuery.isLoading && followersItems.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : followersQuery.isEmpty ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center' }}>
              {t('userProfile.noFollowers')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={followersItems}
            keyExtractor={(f: Follow) => f.id}
            renderItem={({ item }) => renderFollowListRow(item.follower, 'followers')}
            contentContainerStyle={{ paddingBottom: 100 }}
            onEndReached={() => followersQuery.loadMore()}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={followersQuery.isRefetching}
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
      ) : segment === 'following' ? (
        followingQuery.error ? (
          <QueryErrorPanel error={followingQuery.error} onRetry={() => void followingQuery.refetch()} />
        ) : followingQuery.isLoading && followingItems.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={ACCENT} />
          </View>
        ) : followingQuery.isEmpty ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 15, color: colors.mutedForeground, textAlign: 'center' }}>
              {t('userProfile.noFollowing')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={followingItems}
            keyExtractor={(f: Follow) => f.id}
            renderItem={({ item }) => renderFollowListRow(item.following, 'following')}
            contentContainerStyle={{ paddingBottom: 100 }}
            onEndReached={() => followingQuery.loadMore()}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl
                refreshing={followingQuery.isRefetching}
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
      ) : null}
    </SafeAreaView>
  );
}
