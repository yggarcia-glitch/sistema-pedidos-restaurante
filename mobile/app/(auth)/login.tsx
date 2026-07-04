import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { getApiError } from '@/src/api/axios';
import { notify } from '@/src/utils/dialog';
import { Role } from '@/src/types';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

interface FormData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const user = await login(data.email.trim(), data.password);
      // Redirección según rol
      if (user.role === Role.VENDEDOR) router.replace('/(vendor)/dashboard');
      else if (user.role === Role.ADMIN) router.replace('/(admin)/dashboard');
      else router.replace('/(client)');
    } catch (e) {
      notify('Error al iniciar sesión', getApiError(e, 'Credenciales inválidas'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.logo}>🍔</Text>
          <Text style={styles.title}>Sistema de Pedidos</Text>
          <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'El correo es obligatorio',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Correo"
                placeholder="tucorreo@ejemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'La contraseña es obligatoria',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Contraseña"
                placeholder="••••••"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Button
            title="Iniciar sesión"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <Link href="/(auth)/register" style={styles.link}>
              Regístrate
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  container: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  logo: { fontSize: 56, textAlign: 'center' },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: Colors.textSecondary },
  link: { color: Colors.primary, fontWeight: '700' },
});
