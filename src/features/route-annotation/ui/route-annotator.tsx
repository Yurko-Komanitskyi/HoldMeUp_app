import React from 'react';
import { View, Modal, Image, TouchableOpacity, StatusBar, Platform } from 'react-native';
import Svg, { Circle as SvgCircle, Path as SvgPath } from 'react-native-svg';
import { Text } from '@/shared/ui/text';
import { X, Circle, Pencil, Undo2, Trash2, CheckCheck, Eraser } from 'lucide-react-native';
import { ANNOTATION_COLORS, CIRCLE_SIZES, PATH_STROKE_WIDTH } from '../lib/constants';
import type { AnnotationData } from '../model/types';
import { useRouteAnnotator } from '../model/use-route-annotator';

interface Props {
  visible: boolean;
  photoUri: string;
  initial?: AnnotationData | null;
  onSave: (data: AnnotationData) => void;
  onClose: () => void;
}

export function RouteAnnotator({ visible, photoUri, initial, onSave, onClose }: Props) {
  const {
    tool,
    setTool,
    color,
    setColor,
    circleSize,
    setCircleSize,
    shapes,
    livePathD,
    onCanvasLayout,
    panHandlers,
    undo,
    clearAll,
    getExportData,
  } = useRouteAnnotator(initial?.shapes ?? []);

  function handleSave() {
    onSave(getExportData());
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <StatusBar barStyle="light-content" />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: Platform.OS === 'ios' ? 60 : 20,
            paddingBottom: 14,
          }}>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Розмітка маршруту</Text>
          <TouchableOpacity
            onPress={handleSave}
            hitSlop={12}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#3b82f6',
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 20,
            }}>
            <CheckCheck size={16} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Зберегти</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{ flex: 1, position: 'relative' }}
          onLayout={onCanvasLayout}
          {...panHandlers}>
          <Image
            source={{ uri: photoUri }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            resizeMode="contain"
          />
          <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            {shapes.map((shape) => {
              if (shape.type === 'circle') {
                return (
                  <SvgCircle
                    key={shape.id}
                    cx={shape.cx}
                    cy={shape.cy}
                    r={shape.r}
                    stroke={shape.color}
                    strokeWidth={3}
                    fill={shape.color + '40'}
                  />
                );
              }
              return (
                <SvgPath
                  key={shape.id}
                  d={shape.d}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              );
            })}
            {livePathD && (
              <SvgPath
                d={livePathD}
                stroke={color}
                strokeWidth={PATH_STROKE_WIDTH}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.75}
              />
            )}
          </Svg>

          {shapes.length === 0 && (
            <View
              style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                alignItems: 'center',
                pointerEvents: 'none',
              }}>
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                  {tool === 'circle'
                    ? 'Натисни на зачіпку щоб позначити'
                    : 'Проведи пальцем по шляху маршруту'}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View
          style={{
            backgroundColor: '#111',
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: Platform.OS === 'ios' ? 44 : 20,
            gap: 16,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <ToolButton
              icon={<Circle size={20} color={tool === 'circle' ? '#000' : '#fff'} />}
              label="Коло"
              active={tool === 'circle'}
              onPress={() => setTool('circle')}
            />
            <ToolButton
              icon={<Pencil size={20} color={tool === 'path' ? '#000' : '#fff'} />}
              label="Лінія"
              active={tool === 'path'}
              onPress={() => setTool('path')}
            />
            <ToolButton
              icon={<Eraser size={20} color={tool === 'erase' ? '#000' : '#fff'} />}
              label="Стирач"
              active={tool === 'erase'}
              onPress={() => setTool('erase')}
            />
            <View style={{ flex: 1 }} />
            <ActionButton
              icon={<Undo2 size={20} color="#aaa" />}
              label="Скасувати"
              onPress={undo}
            />
            <ActionButton
              icon={<Trash2 size={20} color="#aaa" />}
              label="Очистити"
              onPress={clearAll}
            />
          </View>

          {tool === 'circle' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#666', fontSize: 11, marginRight: 4 }}>Розмір:</Text>
              {CIRCLE_SIZES.map((size) => {
                const isActive = circleSize === size.label;
                const displaySize = size.radius;
                return (
                  <TouchableOpacity
                    key={size.label}
                    onPress={() => setCircleSize(size.label)}
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      height: 44,
                    }}>
                    <View
                      style={{
                        width: displaySize * 2,
                        height: displaySize * 2,
                        borderRadius: displaySize,
                        borderWidth: isActive ? 2.5 : 1.5,
                        borderColor: isActive ? '#7bb4d4' : 'rgba(255,255,255,0.25)',
                        backgroundColor: isActive ? 'rgba(123,180,212,0.15)' : 'transparent',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {isActive && (
                        <Text style={{ color: '#7bb4d4', fontSize: 8, fontWeight: '800' }}>
                          {size.label}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
            {ANNOTATION_COLORS.map((c) => {
              const isActive = color === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setColor(c)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 17,
                    backgroundColor: c,
                    borderWidth: isActive ? 3 : 1.5,
                    borderColor: isActive ? '#7bb4d4' : 'rgba(255,255,255,0.2)',
                    transform: [{ scale: isActive ? 1.15 : 1 }],
                  }}
                />
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ToolButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 22,
        backgroundColor: active ? '#fff' : '#2a2a2a',
      }}>
      {icon}
      <Text style={{ color: active ? '#000' : '#fff', fontSize: 14, fontWeight: '600' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', gap: 3 }}>
      {icon}
      <Text style={{ color: '#777', fontSize: 10 }}>{label}</Text>
    </TouchableOpacity>
  );
}

