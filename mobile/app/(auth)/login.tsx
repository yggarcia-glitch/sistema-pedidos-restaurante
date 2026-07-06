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
import { Colors, Radius, Shadow } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { getApiError } from '@/src/api/axios';
import { notify } from '@/src/utils/dialog';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { BrandMark } from '@/src/components/ui/BrandMark';

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
      await login(data.email.trim(), data.password);
      // La raíz decide: clientes entran a la app; locales/admin ven el aviso web.
      router.replace('/');
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
          <View style={styles.brandWrap}>
            <BrandMark />
          </View>
          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Ingresa para pedir tu comida favorita</Text>

          <View style={styles.card}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'El correo es obligatorio',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo inválido' },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Correo electrónico"
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
          </View>

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
  brandWrap: { alignItems: 'center', marginBottom: 16 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    ...Shadow.card,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: Colors.textSecondary },
  link: { color: Colors.primary, fontWeight: '700' },
});
