import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { getApiError } from '@/src/api/axios';
import { notify } from '@/src/utils/dialog';
import { Role } from '@/src/types';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { BrandMark } from '@/src/components/ui/BrandMark';

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role.CLIENTE | Role.REPARTIDOR>(Role.CLIENTE);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { name: '', email: '', password: '', phone: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await register({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone.trim() || undefined,
        role,
      });
      router.replace(role === Role.REPARTIDOR ? '/(repartidor)' : '/(client)');
    } catch (e) {
      notify('Error al registrarse', getApiError(e));
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
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para hacer tus pedidos</Text>

          <View style={styles.roleSwitch}>
            <TouchableOpacity
              style={[styles.rolePill, role === Role.CLIENTE && styles.rolePillActive]}
              onPress={() => setRole(Role.CLIENTE)}
            >
              <Text style={[styles.rolePillText, role === Role.CLIENTE && styles.rolePillTextActive]}>
                Cliente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rolePill, role === Role.REPARTIDOR && styles.rolePillActive]}
              onPress={() => setRole(Role.REPARTIDOR)}
            >
              <Text
                style={[styles.rolePillText, role === Role.REPARTIDOR && styles.rolePillTextActive]}
              >
                Repartidor
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'El nombre es obligatorio' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nombre completo"
                  placeholder="Tu nombre"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />

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
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Teléfono (opcional)"
                  placeholder="09XXXXXXXX"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
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
              title="Registrarme"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <Link href="/(auth)/login" style={styles.link}>
              Inicia sesión
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
  container: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  brandWrap: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, textAlign: 'center' },
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
  roleSwitch: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  rolePillActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  rolePillText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  rolePillTextActive: { color: Colors.primaryDark },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: Colors.textSecondary },
  link: { color: Colors.primary, fontWeight: '700' },
});
