import * as React from 'react';
import { View, TouchableOpacity, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';

import { Input } from './input';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  className?: string;
}

export function PasswordInput({ className, style, ...rest }: PasswordInputProps) {
  const [show, setShow] = React.useState(false);
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';

  return (
    <View style={{ position: 'relative' }}>
      <Input
        {...rest}
        secureTextEntry={!show}
        className={className}
        style={[{ paddingRight: 44 }, style as object]}
      />
      <TouchableOpacity
        onPress={() => setShow((v) => !v)}
        hitSlop={12}
        style={{
          position: 'absolute',
          right: 12,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {show ? <EyeOff size={18} color={iconColor} /> : <Eye size={18} color={iconColor} />}
      </TouchableOpacity>
    </View>
  );
}
