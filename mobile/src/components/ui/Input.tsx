import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Colors } from '@/src/constants/colors';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, Props>(
  ({ label, error, style, ...rest }, ref) => {
    return (
      <View style={styles.container}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={Colors.textTertiary}
          style={[styles.input, !!error && styles.inputError, style]}
          {...rest}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  inputError: { borderColor: Colors.dangerText },
  error: { color: Colors.dangerText, fontSize: 13, marginTop: 4 },
});
