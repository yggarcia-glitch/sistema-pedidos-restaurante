import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius } from '@/src/constants/colors';
import { reviewsApi } from '@/src/api/reviews.api';
import { getApiError } from '@/src/api/axios';
import { notify } from '@/src/utils/dialog';
import { haptics } from '@/src/utils/haptics';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';

interface Props {
  visible: boolean;
  restaurantId: string;
  restaurantName?: string;
  orderId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

// Calificación post-entrega (1-5 estrellas + comentario opcional). Se abre
// automáticamente al llegar a ENTREGADO en el tracking, y también se puede
// disparar manualmente desde el historial ("Calificar").
export function RatingModal({
  visible,
  restaurantId,
  restaurantName,
  orderId,
  onClose,
  onSubmitted,
}: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await reviewsApi.create({ restaurantId, orderId, rating, comment: comment.trim() || undefined });
      haptics.success();
      setRating(0);
      setComment('');
      onSubmitted();
    } catch (e) {
      notify('No se pudo enviar tu calificación', getApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title={`¿Cómo estuvo ${restaurantName ?? 'tu pedido'}?`}>
      <Text style={styles.subtitle}>Tu opinión ayuda a otros clientes a elegir mejor.</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setRating(n)} hitSlop={8}>
            <Ionicons
              name={n <= rating ? 'star' : 'star-outline'}
              size={36}
              color={Colors.amber}
            />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        style={styles.comment}
        placeholder="Cuéntanos más (opcional)…"
        placeholderTextColor={Colors.textTertiary}
        value={comment}
        onChangeText={setComment}
        multiline
      />
      <Button
        title="Enviar calificación"
        onPress={handleSubmit}
        loading={loading}
        disabled={rating === 0}
        fullWidth
        style={{ marginTop: 8 }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 18 },
  comment: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    padding: 12,
    minHeight: 70,
    textAlignVertical: 'top',
    color: Colors.text,
    marginBottom: 8,
  },
});
