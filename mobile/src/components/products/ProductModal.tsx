import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { money } from '@/src/constants/status';
import { Product, ProductOption } from '@/src/types';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';

interface Props {
  product: Product | null;
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, choiceIds: string[]) => void;
}

export function ProductModal({
  product,
  visible,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  // Selección por opción: optionId -> array de choiceIds seleccionados.
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  // Reinicia el estado cada vez que se abre con un producto nuevo.
  React.useEffect(() => {
    if (visible) {
      setQuantity(1);
      setSelected({});
    }
  }, [visible, product?.id]);

  const toggleChoice = (option: ProductOption, choiceId: string) => {
    setSelected((prev) => {
      const current = prev[option.id] ?? [];
      // maxSelect === 1 -> radio (reemplaza). maxSelect > 1 -> checkbox (acumula).
      if (option.maxSelect === 1) {
        return { ...prev, [option.id]: [choiceId] };
      }
      if (current.includes(choiceId)) {
        return { ...prev, [option.id]: current.filter((c) => c !== choiceId) };
      }
      if (current.length >= option.maxSelect) return prev; // no supera el máximo
      return { ...prev, [option.id]: [...current, choiceId] };
    });
  };

  const allChoiceIds = useMemo(() => Object.values(selected).flat(), [selected]);

  // Precio total = (precio con descuento + extras) * cantidad
  const total = useMemo(() => {
    if (!product) return 0;
    const base = Number(product.price) * (1 - (product.discountPct ?? 0) / 100);
    let extras = 0;
    product.options?.forEach((opt) => {
      opt.choices.forEach((ch) => {
        if (selected[opt.id]?.includes(ch.id)) extras += Number(ch.extraPrice);
      });
    });
    return (base + extras) * quantity;
  }, [product, selected, quantity]);

  // Valida que las opciones obligatorias tengan al menos minSelect elecciones.
  const missingRequired = useMemo(() => {
    if (!product?.options) return false;
    return product.options.some(
      (opt) =>
        opt.isRequired && (selected[opt.id]?.length ?? 0) < Math.max(1, opt.minSelect),
    );
  }, [product, selected]);

  if (!product) return null;

  return (
    <Modal visible={visible} onClose={onClose} title={product.name}>
      {product.description ? (
        <Text style={styles.desc}>{product.description}</Text>
      ) : null}

      {product.options?.map((opt) => (
        <View key={opt.id} style={styles.optionBlockWrap}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>{opt.name}</Text>
            {opt.isRequired && <Text style={styles.required}>Obligatorio</Text>}
          </View>
          {opt.choices.map((ch) => {
            const isSelected = selected[opt.id]?.includes(ch.id);
            const isRadio = opt.maxSelect === 1;
            return (
              <TouchableOpacity
                key={ch.id}
                style={styles.choiceRow}
                onPress={() => toggleChoice(opt, ch.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    isRadio
                      ? isSelected
                        ? 'radio-button-on'
                        : 'radio-button-off'
                      : isSelected
                        ? 'checkbox'
                        : 'square-outline'
                  }
                  size={22}
                  color={isSelected ? Colors.primary : Colors.textTertiary}
                />
                <Text style={styles.choiceName}>{ch.name}</Text>
                {Number(ch.extraPrice) > 0 && (
                  <Text style={styles.extra}>+{money(ch.extraPrice)}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Control de cantidad */}
      <View style={styles.qtyRow}>
        <Text style={styles.qtyLabel}>Cantidad</Text>
        <View style={styles.qtyControls}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Ionicons name="remove" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Ionicons name="add" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Button
        title={`Agregar · ${money(total)}`}
        onPress={() => onConfirm(quantity, allChoiceIds)}
        loading={loading}
        disabled={missingRequired}
        fullWidth
        style={{ marginTop: 8 }}
      />
      {missingRequired && (
        <Text style={styles.warn}>Selecciona las opciones obligatorias</Text>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  optionBlockWrap: { marginBottom: 16 },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  required: { fontSize: 12, color: Colors.dangerText, fontWeight: '600' },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  choiceName: { flex: 1, fontSize: 14, color: Colors.text },
  extra: { fontSize: 14, color: Colors.textSecondary },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  qtyLabel: { fontSize: 15, fontWeight: '700', color: Colors.text },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { fontSize: 18, fontWeight: '700', color: Colors.text, minWidth: 24, textAlign: 'center' },
  warn: { color: Colors.dangerText, fontSize: 13, textAlign: 'center', marginTop: 8 },
});
