import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Radius, Shadow } from '@/src/constants/colors';
import { useClientTheme, Palette } from '@/src/theme/ClientThemeContext';
import { Address } from '@/src/types';
import { addressesApi } from '@/src/api/addresses.api';
import { getApiError } from '@/src/api/axios';
import { confirmAction, notify } from '@/src/utils/dialog';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Spinner } from '@/src/components/ui/Spinner';

const emptyForm = {
  label: '',
  street: '',
  city: '',
  province: '',
  latitude: null as number | null,
  longitude: null as number | null,
};

export default function AddressesScreen() {
  const router = useRouter();
  const { colors } = useClientTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await addressesApi.findAllMine();
      setAddresses(data);
    } catch (e) {
      notify('Error', getApiError(e, 'No se pudieron cargar tus direcciones'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const startNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setEditing(true);
  };

  const startEdit = (a: Address) => {
    setForm({
      label: a.label,
      street: a.street,
      city: a.city,
      province: a.province,
      latitude: a.latitude,
      longitude: a.longitude,
    });
    setEditingId(a.id);
    setEditing(true);
  };

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        notify('Permiso denegado', 'Necesitamos tu ubicación para completar la dirección.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setForm((f) => ({
        ...f,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }));
      notify('Listo', 'Se usó tu ubicación actual para esta dirección.');
    } catch {
      notify('Error', 'No se pudo obtener tu ubicación.');
    } finally {
      setLocating(false);
    }
  };

  const handleSave = async () => {
    if (!form.label.trim() || !form.street.trim() || !form.city.trim() || !form.province.trim()) {
      notify('Completa los campos', 'Etiqueta, calle, ciudad y provincia son obligatorios.');
      return;
    }
    if (form.latitude == null || form.longitude == null) {
      notify('Falta la ubicación', 'Usa "Usar mi ubicación actual" para fijar el punto en el mapa.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        label: form.label.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
      };
      if (editingId) {
        await addressesApi.update(editingId, payload);
      } else {
        await addressesApi.create(payload);
      }
      setEditing(false);
      await load();
    } catch (e) {
      notify('Error', getApiError(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (a: Address) => {
    confirmAction(
      'Eliminar dirección',
      `¿Eliminar "${a.label}"?`,
      async () => {
        try {
          await addressesApi.remove(a.id);
          await load();
        } catch (e) {
          notify('Error', getApiError(e));
        }
      },
      { confirmText: 'Eliminar', destructive: true },
    );
  };

  const handleSetDefault = async (a: Address) => {
    try {
      await addressesApi.setDefault(a.id);
      await load();
    } catch (e) {
      notify('Error', getApiError(e));
    }
  };

  if (loading) return <Spinner text="Cargando direcciones…" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Mis direcciones</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!editing && (
          <>
            {addresses.map((a) => (
              <View key={a.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="location" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardLabel}>{a.label}</Text>
                    <Text style={styles.cardAddress} numberOfLines={2}>
                      {a.street}, {a.city}, {a.province}
                    </Text>
                  </View>
                  {a.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Predeterminada</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardActions}>
                  {!a.isDefault && (
                    <TouchableOpacity onPress={() => handleSetDefault(a)}>
                      <Text style={styles.actionText}>Predeterminar</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => startEdit(a)}>
                    <Text style={styles.actionText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(a)}>
                    <Text style={[styles.actionText, styles.actionDanger]}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {addresses.length === 0 && (
              <Text style={styles.emptyText}>Todavía no tienes direcciones guardadas.</Text>
            )}
            <Button title="Agregar dirección" onPress={startNew} fullWidth />
          </>
        )}

        {editing && (
          <View style={styles.form}>
            <Input
              label="Etiqueta"
              placeholder="Casa, Trabajo…"
              value={form.label}
              onChangeText={(t) => setForm((f) => ({ ...f, label: t }))}
            />
            <Input
              label="Calle y número"
              value={form.street}
              onChangeText={(t) => setForm((f) => ({ ...f, street: t }))}
            />
            <Input
              label="Ciudad"
              value={form.city}
              onChangeText={(t) => setForm((f) => ({ ...f, city: t }))}
            />
            <Input
              label="Provincia"
              value={form.province}
              onChangeText={(t) => setForm((f) => ({ ...f, province: t }))}
            />

            <TouchableOpacity style={styles.locateBtn} onPress={useCurrentLocation} disabled={locating}>
              <Ionicons name="navigate" size={18} color={colors.primary} />
              <Text style={styles.locateText}>
                {locating
                  ? 'Ubicando…'
                  : form.latitude != null
                    ? 'Ubicación fijada ✓ (tocar para actualizar)'
                    : 'Usar mi ubicación actual'}
              </Text>
            </TouchableOpacity>

            <View style={styles.formActions}>
              <Button title="Cancelar" variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }} />
              <Button title="Guardar" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: { fontSize: 20, fontWeight: '800', color: colors.text },
    content: { padding: 16, gap: 12 },
    card: {
      backgroundColor: colors.white,
      borderRadius: Radius.card,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      ...Shadow.card,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    cardIcon: {
      width: 36,
      height: 36,
      borderRadius: 999,
      backgroundColor: colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardLabel: { fontSize: 15, fontWeight: '800', color: colors.text },
    cardAddress: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
    defaultBadge: {
      backgroundColor: colors.success,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: Radius.pill,
    },
    defaultBadgeText: { fontSize: 10, fontWeight: '800', color: colors.successText },
    cardActions: {
      flexDirection: 'row',
      gap: 18,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionText: { fontSize: 13, fontWeight: '700', color: colors.primary },
    actionDanger: { color: colors.dangerText },
    emptyText: { textAlign: 'center', color: colors.textSecondary, paddingVertical: 20 },
    form: { gap: 4 },
    locateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primaryLight,
      borderRadius: Radius.input,
      padding: 14,
      marginBottom: 20,
    },
    locateText: { fontSize: 14, fontWeight: '700', color: colors.primaryDark, flex: 1 },
    formActions: { flexDirection: 'row', gap: 12 },
  });
